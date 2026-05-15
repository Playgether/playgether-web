"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  buildYoutubeChannelAvatarUrl,
  extractYoutubeVideoId,
  fetchYoutubeOEmbedMeta,
} from "@/lib/youtube";
import {
  ChevronLeft,
  ChevronRight,
  Film,
  LayoutGrid,
  Maximize2,
  MessageSquare,
  Radio,
  RefreshCw,
  Send,
  Settings,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { RoomAmbienceMessage } from "@/types/RoomAmbience";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type YtVideoData = {
  video_id?: string;
  title?: string;
  author?: string;
  isLive?: boolean;
  isLiveHls?: boolean;
};

type YtPlayer = {
  destroy: () => void;
  loadVideoById: (arg: { videoId: string; startSeconds?: number } | string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  getCurrentTime?: () => number;
  getPlayerState?: () => number;
  getDuration?: () => number;
  getVideoData?: () => YtVideoData;
  getIframe?: () => HTMLIFrameElement | null;
};

/** Pequena = layout clássico; Cinema = painel em tela cheia do navegador; Tela cheia = só o player (estilo YouTube). */
type ViewMode = "small" | "cinema" | "fullplayer";

/** Modo de sincronização do viewer com o host. Hosts não usam essa flag. */
type SyncMode = "synced" | "independent";

/**
 * Janela em que ignoramos `onStateChange` do viewer como “ação do usuário” após
 * `seekTo`/`playVideo`/`pauseVideo` nossos.
 */
const REMOTE_APPLY_GUARD_MS = 3200;

/** |drift| estritamente menor que isto = “Ao vivo com host”; a partir daqui = independente na UI e botão Sincronizar. */
const DRIFT_MAX_ALIGNED_SEC = 2;

/**
 * Margem (s) antes do fim da janela DVR = ponto “ao vivo” no YouTube (não recuar ~10s).
 */
const LIVE_STREAM_EDGE_EPS_SEC = 0.4;

/**
 * Se o alvo está a até esta distância (s) abaixo do teto DVR, usamos `seekTo(MAX, true)`
 * (equivalente a “Ir ao vivo” no YouTube). Um `seekTo` com segundo absoluto perto do fim
 * costuma recuar vários segundos no iframe.
 */
const LIVE_GO_SEEK_MAX_BELOW_CAP_SEC = 18;

/**
 * Host em live: o botão “Ir ao vivo” do YouTube nem sempre produz |jump| > limite num único
 * tick; detectamos salto para a borda do DVR vindo de vários segundos atrás.
 */
const LIVE_HOST_EDGE_JUMP_BACK_MIN_SEC = 5;
const LIVE_HOST_EDGE_JUMP_TOLERANCE_SEC = 2.5;

/**
 * Após novo `sync_epoch_ms` (seek/play/pause do host ou resposta ao Sincronizar), ignoramos
 * saltos enormes na timeline do viewer — costumam ser o iframe a alinhar, não o usuário.
 */
const VIEWER_JUMP_IGNORE_INDEP_MS_AFTER_SYNC_EPOCH = 4500;

/** Diferença (em segundos) entre posição atual e esperada a partir da qual consideramos um seek (host). */
const SEEK_JUMP_THRESHOLD_SEC = 2.5;

/** Atualização suave do número de drift na UI. */
const DRIFT_UPDATE_THRESHOLD_SEC = 0.55;

/** Estados YouTube IFrame API (trecho usado em `applyPlaybackFromState`). */
const YT_BUFFERING = 3;

/** Saltos internos da timeline em live (DVR) não devem derrubar o modo synced. */
const LIVE_VIEWER_JUMP_THRESHOLD_SEC = 22;

/** Só chama `seekTo` se estivermos mais longe que isto do alvo (VOD e live estável). */
const APPLY_SEEK_THRESHOLD_SEC = 1.15;

/** Detecta vídeos ao vivo via campos não-documentados do iframe API. */
function isLivePlayer(p: YtPlayer | null): boolean {
  if (!p) return false;
  try {
    const data = p.getVideoData?.();
    if (data?.isLive) return true;
    if (data?.isLiveHls) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Teto de `currentTime` em live (borda “ao vivo”, não vários segundos atrás). */
function liveStreamTimelineCap(p: YtPlayer | null): number {
  if (!p) return Number.MAX_SAFE_INTEGER;
  try {
    const dur = p.getDuration?.() ?? 0;
    if (dur > 0 && Number.isFinite(dur)) {
      return Math.max(0, dur - LIVE_STREAM_EDGE_EPS_SEC);
    }
  } catch {
    /* ignore */
  }
  return Number.MAX_SAFE_INTEGER;
}

/** Limite superior para seeks do host em live (controles / saltos). */
function liveMaxSeekSeconds(p: YtPlayer | null): number | null {
  if (!p || !isLivePlayer(p)) return null;
  try {
    const dur = p.getDuration?.() ?? 0;
    if (!Number.isFinite(dur) || dur <= 0) return null;
    return Math.max(0, dur - LIVE_STREAM_EDGE_EPS_SEC);
  } catch {
    return null;
  }
}

let ytIframeApiPromise: Promise<void> | null = null;
function loadYoutubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as Window & {
    YT?: { Player: new (el: HTMLElement | string, opts: unknown) => YtPlayer };
    onYouTubeIframeAPIReady?: () => void;
  };
  if (w.YT?.Player) return Promise.resolve();
  if (ytIframeApiPromise) return ytIframeApiPromise;
  ytIframeApiPromise = new Promise((resolve) => {
    const prior = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prior?.();
      resolve();
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(s);
  });
  return ytIframeApiPromise;
}

function YoutubeMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 18"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="currentColor"
        d="M23.5 4.2c-.3-1.1-1.2-2-2.3-2.3C19.3 1.2 12 1.2 12 1.2s-7.3 0-9.2.7c-1.1.3-2 1.2-2.3 2.3C0 6.1 0 9 0 9s0 2.9.5 4.8c.3 1.1 1.2 2 2.3 2.3 1.9.7 9.2.7 9.2.7s7.3 0 9.2-.7c1.1-.3 2-1.2 2.3-2.3.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8zM9.5 12.4V5.6L15.7 9 9.5 12.4z"
      />
    </svg>
  );
}

function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function viewStorageKey(roomSlug: string) {
  return `playgether:ambience-view:${roomSlug}`;
}

function readStoredViewMode(roomSlug: string): ViewMode {
  if (typeof window === "undefined") return "small";
  try {
    const raw = localStorage.getItem(viewStorageKey(roomSlug));
    if (raw === "small" || raw === "cinema" || raw === "fullplayer") return raw;
    if (raw === "compact") return "small";
    if (raw === "fullscreen") return "cinema";
    if (raw === "cinema") return "small";
  } catch {
    /* ignore */
  }
  return "small";
}

/** Sempre descreve o desvio em segundos (rótulos fora do chip “Ao vivo com host”). */
function formatDriftOffsetOnly(driftSec: number): string {
  const abs = Math.abs(driftSec);
  if (abs < 0.55) return "menos de 1s na timeline";
  const rounded = Math.round(abs);
  const unit = rounded === 1 ? "1s" : `${rounded}s`;
  return driftSec > 0 ? `${unit} à frente do host` : `${unit} atrás do host`;
}

function computeSyncedSeconds(
  playing: boolean,
  positionSec: number,
  syncEpochMs: number,
): number {
  const elapsed = Math.max(0, (Date.now() - syncEpochMs) / 1000);
  return playing ? positionSec + elapsed : positionSec;
}

/** Timeline do host no player, limitada ao “ao vivo” do DVR (não forçar ~10s atrás). */
function liveViewerTargetSeconds(
  p: YtPlayer | null,
  playing: boolean,
  positionSec: number,
  syncEpochMs: number,
): number {
  const hostTimeline = computeSyncedSeconds(playing, positionSec, syncEpochMs);
  const cap = liveStreamTimelineCap(p);
  if (!Number.isFinite(cap) || cap >= Number.MAX_SAFE_INTEGER / 4) {
    return hostTimeline;
  }
  return Math.min(hostTimeline, cap);
}

/**
 * Em live, `create` / `change_video` deixam `position_sec` em 0 no servidor até o host
 * mandar um seek/play com o tempo real do iframe. Se o espectador sincroniza antes
 * disso, o alvo calculado fica perto do 0 do DVR (= “começo” do buffer) — evitamos
 * esse salto quando o estado da sala ainda está claramente desancorado.
 */
function remediateLiveStaleServerSeekTarget(
  p: YtPlayer,
  desiredPlaying: boolean,
  serverPositionSec: number,
  serverDerivedTimeline: number,
  viewerCurrent: number,
): number {
  if (!desiredPlaying || serverPositionSec >= 8) return serverDerivedTimeline;
  let dur = 0;
  try {
    dur = p.getDuration?.() ?? 0;
  } catch {
    return serverDerivedTimeline;
  }
  if (!Number.isFinite(dur) || dur < 120) return serverDerivedTimeline;
  const cap = liveStreamTimelineCap(p);
  if (!Number.isFinite(cap) || cap >= Number.MAX_SAFE_INTEGER / 4) return serverDerivedTimeline;
  if (
    serverDerivedTimeline < 85 &&
    viewerCurrent > dur * 0.12 &&
    viewerCurrent - serverDerivedTimeline > 150
  ) {
    return Math.min(Math.max(serverDerivedTimeline, viewerCurrent), cap);
  }
  return serverDerivedTimeline;
}

function watchingNowLabel(count: number): string {
  if (count === 1) return "1 pessoa assistindo agora";
  return `${count} pessoas assistindo agora`;
}

function ChatFloatUnreadBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span className="pointer-events-none absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm tabular-nums">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function ambienceMessageIsSystem(m: RoomAmbienceMessage): boolean {
  return Boolean(m.is_system || m.author_user_id === 0);
}

const AmbienceChatLine = memo(function AmbienceChatLine({
  m,
  variant = "sidebar",
}: {
  m: RoomAmbienceMessage;
  variant?: "sidebar" | "float";
}) {
  const float = variant === "float";
  const motion = !float
    ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    : "";
  if (ambienceMessageIsSystem(m)) {
    return (
      <div
        className={cn(
          "max-w-[95%] rounded-2xl border px-3 py-2 text-sm shadow-sm [contain:content]",
          motion,
          float
            ? "border-white/25 bg-black text-zinc-100 shadow-black/40"
            : "border-border/60 bg-muted/50 text-muted-foreground",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            float ? "text-zinc-400" : "text-muted-foreground",
          )}
        >
          Sistema
        </p>
        <p className={cn("whitespace-pre-wrap", float ? "text-zinc-50" : "text-foreground")}>
          {m.body}
        </p>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex gap-2 rounded-lg border px-2 py-2 [contain:content]",
        motion,
        float
          ? "border-white/20 bg-black text-zinc-50 shadow-sm shadow-black/40 ring-1 ring-white/5"
          : "border-border/40 bg-muted/20 text-foreground",
      )}
    >
      <ProfileAvatar
        displayName={m.author_username}
        username={m.author_username}
        profilePhoto={m.author_photo}
        sizeClass="h-8 w-8"
        fallbackTextClassName="text-[10px]"
        className={cn("mt-0.5 shrink-0 ring-1", float ? "ring-white/25" : "ring-border")}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] font-semibold", float ? "text-zinc-100" : "text-foreground")}>
          {m.author_username}
        </p>
        <p className={cn("text-sm", float ? "text-zinc-50" : "text-foreground")}>{m.body}</p>
      </div>
    </div>
  );
});

export default function RoomAmbiencePanel({
  roomSlug,
  entered,
  onEnteredChange,
}: {
  roomSlug: string;
  entered: boolean;
  onEnteredChange: (entered: boolean) => void;
}) {
  const { user } = useAuthContext();
  const {
    roomAmbience,
    roomAmbienceMessages,
    sendRoomAmbience,
    roomAmbienceError,
    clearRoomAmbienceError,
  } = useChatHandlerContext();

  const [createUrl, setCreateUrl] = useState("");
  const [changeUrl, setChangeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [chatText, setChatText] = useState("");
  const [localVolume, setLocalVolume] = useState(80);
  const preMuteVolumeRef = useRef(80);
  const [chatOpen, setChatOpen] = useState(true);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [changeVideoOpen, setChangeVideoOpen] = useState(false);
  const [playerFloatChatOpen, setPlayerFloatChatOpen] = useState(false);
  const [playerFloatParticipantsOpen, setPlayerFloatParticipantsOpen] = useState(false);
  const [floatChatLastSeenId, setFloatChatLastSeenId] = useState(0);
  const [layoutPulse, setLayoutPulse] = useState(0);
  const [dialogPortal, setDialogPortal] = useState<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => readStoredViewMode(roomSlug));
  const [syncMode, setSyncModeState] = useState<SyncMode>("synced");
  const [driftSec, setDriftSec] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const panelLoadRef = useRef({
    chatOpen: true,
    playerFloatChatOpen: false,
    participantsOpen: false,
    playerFloatParticipantsOpen: false,
    settingsOpen: false,
  });
  const mountRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const floatChatEndRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const playerStageRef = useRef<HTMLDivElement | null>(null);
  const wasPlayerFsRef = useRef(false);
  const prevPlayerFsRef = useRef(false);
  const lastFsKindRef = useRef<"shell" | "player" | null>(null);
  const programmaticFsRef = useRef(false);
  const programmaticModeTargetRef = useRef<ViewMode | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement | null>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);

  /**
   * Timestamp em ms até quando devemos ignorar eventos `onStateChange` do player
   * (porque nós mesmos estamos aplicando o estado do host). Fora dessa janela,
   * mudanças de estado vêm do usuário interagindo com o player.
   */
  const applyingRemoteUntilRef = useRef(0);
  /** Um único seek após “Sincronizar” (cancela o anterior se clicar de novo). */
  const manualSyncOnceTimerRef = useRef(0);
  /** Última leitura do tempo/estado do player, usada para detectar saltos (seeks). */
  const lastPlayerTickRef = useRef<{ at: number; pos: number; playing: boolean } | null>(null);
  /** Último video_id aplicado — usado para resetar syncMode quando o host troca de vídeo. */
  const lastAppliedVideoIdRef = useRef<string>("");

  /** `sync_epoch_ms` anterior (para saber quando o host publicou nova linha do tempo). */
  const prevSyncEpochForJumpGraceRef = useRef(roomAmbience.sync_epoch_ms);
  const hostPlaybackEpochChangedAtMsRef = useRef(0);

  const syncModeRef = useRef<SyncMode>(syncMode);
  const setSyncMode = useCallback((m: SyncMode) => {
    syncModeRef.current = m;
    setSyncModeState(m);
  }, []);

  const amHost =
    user?.user_id != null &&
    roomAmbience.active &&
    roomAmbience.host_user_id === Number(user.user_id);

  const viewerAlignedMaxDriftSec = DRIFT_MAX_ALIGNED_SEC;

  /** Timeline a menos de 2s do host (eixo usado para “em sincronia” na barra e nas configs). */
  const viewerTimelineAligned = !amHost && Math.abs(driftSec) < viewerAlignedMaxDriftSec;

  useEffect(() => {
    if (roomAmbience.sync_epoch_ms !== prevSyncEpochForJumpGraceRef.current) {
      prevSyncEpochForJumpGraceRef.current = roomAmbience.sync_epoch_ms;
      hostPlaybackEpochChangedAtMsRef.current = Date.now();
    }
  }, [roomAmbience.sync_epoch_ms]);

  /**
   * Mantemos refs com os valores mais recentes de `amHost`, do estado da transmissão
   * e do `sendRoomAmbience`, porque os event handlers do YT iframe (`onStateChange`)
   * são definidos uma única vez na criação do player e veriam closures defasadas.
   */
  const amHostRef = useRef(amHost);
  const roomAmbienceRef = useRef(roomAmbience);
  const sendRoomAmbienceRef = useRef(sendRoomAmbience);
  useEffect(() => {
    amHostRef.current = amHost;
  }, [amHost]);
  useEffect(() => {
    roomAmbienceRef.current = roomAmbience;
  }, [roomAmbience]);
  useEffect(() => {
    sendRoomAmbienceRef.current = sendRoomAmbience;
  }, [sendRoomAmbience]);

  /** Marca um período curto em que ignoramos mudanças de estado do player como ações do usuário. */
  const markApplyingRemote = useCallback((durationMs = REMOTE_APPLY_GUARD_MS) => {
    applyingRemoteUntilRef.current = Date.now() + durationMs;
  }, []);

  /** Host: qualquer pedido de âncora publica o tempo atual do iframe (fonte da verdade). */
  useEffect(() => {
    const onAnchorRequest = () => {
      if (!amHostRef.current) return;
      const pl = playerRef.current;
      if (!pl?.getCurrentTime) return;
      try {
        let t = pl.getCurrentTime();
        const live = isLivePlayer(pl);
        if (live) {
          const mx = liveMaxSeekSeconds(pl);
          if (mx != null) {
            const raw = t;
            if (raw >= mx - LIVE_GO_SEEK_MAX_BELOW_CAP_SEC) {
              try {
                pl.seekTo(Number.MAX_SAFE_INTEGER, true);
              } catch {
                /* ignore */
              }
              t = mx;
            } else {
              t = Math.min(Math.max(0, raw), mx);
            }
          } else {
            t = Math.max(0, t);
          }
        } else {
          t = Math.max(0, t);
        }
        markApplyingRemote(REMOTE_APPLY_GUARD_MS);
        sendRoomAmbienceRef.current({ action: "seek", position_sec: t });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("playgether:ambience-anchor-request", onAnchorRequest);
    return () => window.removeEventListener("playgether:ambience-anchor-request", onAnchorRequest);
  }, [markApplyingRemote]);

  const channelLabel =
    roomAmbience.channel_name?.trim() || "Canal do YouTube";
  const channelHref =
    roomAmbience.channel_url?.trim() || "https://www.youtube.com/";

  const channelImg = useMemo(() => {
    const fromServer = roomAmbience.channel_avatar_url?.trim();
    if (fromServer) return fromServer;
    const built = buildYoutubeChannelAvatarUrl(roomAmbience.channel_url);
    if (built) return built;
    const thumb = roomAmbience.channel_thumbnail?.trim();
    if (thumb) return thumb;
    if (roomAmbience.video_id) {
      return `https://i.ytimg.com/vi/${encodeURIComponent(roomAmbience.video_id)}/hqdefault.jpg`;
    }
    return "";
  }, [
    roomAmbience.channel_avatar_url,
    roomAmbience.channel_url,
    roomAmbience.channel_thumbnail,
    roomAmbience.video_id,
  ]);

  useEffect(() => {
    if (!roomAmbience.active || !entered) return;
    sendRoomAmbience({ action: "viewer_join" });
    return () => {
      sendRoomAmbience({ action: "viewer_leave" });
    };
  }, [roomAmbience.active, entered, sendRoomAmbience]);

  useEffect(() => {
    try {
      localStorage.setItem(viewStorageKey(roomSlug), viewMode);
    } catch {
      /* ignore */
    }
  }, [roomSlug, viewMode]);

  const layoutHighlight = useMemo((): ViewMode => {
    void layoutPulse;
    if (typeof document === "undefined") return viewMode;
    const shellEl = shellRef.current;
    const playerEl = playerStageRef.current;
    const fs = document.fullscreenElement;
    if (playerEl && fs === playerEl) return "fullplayer";
    if (shellEl && fs === shellEl) return "cinema";
    if (viewMode === "fullplayer") return "fullplayer";
    if (viewMode === "cinema") return "cinema";
    return "small";
  }, [layoutPulse, viewMode]);

  const playerIsFs = useMemo(() => {
    void layoutPulse;
    if (typeof document === "undefined") return false;
    const playerEl = playerStageRef.current;
    return Boolean(playerEl && document.fullscreenElement === playerEl);
  }, [layoutPulse]);

  const toggleChatPanel = useCallback(() => {
    const playerEl = playerStageRef.current;
    if (playerEl && document.fullscreenElement === playerEl) {
      setPlayerFloatChatOpen((o) => !o);
    } else {
      setChatOpen((o) => !o);
    }
  }, []);

  const toggleParticipantsPanel = useCallback(() => {
    const playerEl = playerStageRef.current;
    if (playerEl && document.fullscreenElement === playerEl) {
      setPlayerFloatParticipantsOpen((o) => !o);
    } else {
      setParticipantsOpen((o) => !o);
    }
  }, []);

  const chatPanelHighlighted =
    (playerIsFs && playerFloatChatOpen) || (!playerIsFs && chatOpen);

  const participantsPanelHighlighted =
    (playerIsFs && playerFloatParticipantsOpen) || (!playerIsFs && participantsOpen);

  const floatChatUnreadCount = useMemo(() => {
    if (!playerIsFs || playerFloatChatOpen) return 0;
    return roomAmbienceMessages.filter((m) => m.id > floatChatLastSeenId).length;
  }, [playerIsFs, playerFloatChatOpen, roomAmbienceMessages, floatChatLastSeenId]);

  const floatChatMessages = useMemo(
    () => roomAmbienceMessages.slice(-80),
    [roomAmbienceMessages],
  );

  const latestMessageIdRef = useRef(0);
  useEffect(() => {
    latestMessageIdRef.current = roomAmbienceMessages.at(-1)?.id ?? 0;
  }, [roomAmbienceMessages]);

  useLayoutEffect(() => {
    if (playerIsFs && !prevPlayerFsRef.current) {
      setFloatChatLastSeenId(latestMessageIdRef.current);
    }
    prevPlayerFsRef.current = playerIsFs;
  }, [playerIsFs]);

  const prevFloatChatOpenRef = useRef(false);
  useEffect(() => {
    if (!playerIsFs) {
      prevFloatChatOpenRef.current = playerFloatChatOpen;
      return;
    }
    const wasOpen = prevFloatChatOpenRef.current;
    if (playerFloatChatOpen !== wasOpen) {
      setFloatChatLastSeenId(latestMessageIdRef.current);
      prevFloatChatOpenRef.current = playerFloatChatOpen;
    }
  }, [playerFloatChatOpen, playerIsFs]);

  useEffect(() => {
    if (wasPlayerFsRef.current && !playerIsFs && playerFloatChatOpen) {
      setChatOpen(true);
      setPlayerFloatChatOpen(false);
    }
    if (wasPlayerFsRef.current && !playerIsFs && playerFloatParticipantsOpen) {
      setParticipantsOpen(true);
      setPlayerFloatParticipantsOpen(false);
    }
    wasPlayerFsRef.current = playerIsFs;
  }, [playerIsFs, playerFloatChatOpen, playerFloatParticipantsOpen]);

  useLayoutEffect(() => {
    panelLoadRef.current = {
      chatOpen,
      playerFloatChatOpen,
      participantsOpen,
      playerFloatParticipantsOpen,
      settingsOpen,
    };
  }, [chatOpen, playerFloatChatOpen, participantsOpen, playerFloatParticipantsOpen, settingsOpen]);

  useEffect(() => {
    const onFs = () => {
      setLayoutPulse((p) => p + 1);
      const fsEl = document.fullscreenElement;
      setDialogPortal(fsEl instanceof HTMLElement ? fsEl : null);

      if (programmaticFsRef.current) {
        if (!fsEl && programmaticModeTargetRef.current != null) {
          const next = programmaticModeTargetRef.current;
          programmaticModeTargetRef.current = null;
          programmaticFsRef.current = false;
          setViewMode(next);
          queueMicrotask(() => setLayoutPulse((c) => c + 1));
          return;
        }
        if (fsEl) {
          if (fsEl === shellRef.current) lastFsKindRef.current = "shell";
          else if (fsEl === playerStageRef.current) lastFsKindRef.current = "player";
        }
        return;
      }

      const el = fsEl;
      if (el) {
        if (el === shellRef.current) lastFsKindRef.current = "shell";
        else if (el === playerStageRef.current) lastFsKindRef.current = "player";
        return;
      }
      if (programmaticModeTargetRef.current) {
        const next = programmaticModeTargetRef.current;
        programmaticModeTargetRef.current = null;
        setViewMode(next);
        return;
      }
      const kind = lastFsKindRef.current;
      lastFsKindRef.current = null;
      if (kind === "shell") setViewMode("small");
      else if (kind === "player") setViewMode("small");
    };
    onFs();
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (viewMode !== "cinema") return;
    const el = shellRef.current;
    if (!el) return;
    void (async () => {
      try {
        if (document.fullscreenElement !== el) {
          await el.requestFullscreen();
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      if (document.fullscreenElement === el) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== "fullplayer") return;
    const el = playerStageRef.current;
    if (!el) return;
    void (async () => {
      try {
        if (document.fullscreenElement !== el) {
          await el.requestFullscreen();
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      if (document.fullscreenElement === el) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, [viewMode]);

  /**
   * Aplica estado do host no viewer quando o host altera reprodução (novo `sync_epoch_ms`
   * no servidor: seek / play / pause). Não reage a cada tick de posição — só quando o
   * servidor publica nova linha do tempo (`sync_epoch_ms`). Em live, o alvo respeita a
   * borda “ao vivo” do DVR (`liveStreamTimelineCap`).
   */
  const applyPlaybackFromState = useCallback(
    (opts?: {
      forceSeek?: boolean;
      deferSeekWhileBuffering?: boolean;
      guardMs?: number;
    }) => {
      const p = playerRef.current;
      const ra = roomAmbienceRef.current;
      if (!p || !ra.active || !ra.video_id) return;

      const live = isLivePlayer(p);
      const desiredPlaying = ra.playing;
      let targetPos = live
        ? liveViewerTargetSeconds(p, desiredPlaying, ra.position_sec, ra.sync_epoch_ms)
        : computeSyncedSeconds(desiredPlaying, ra.position_sec, ra.sync_epoch_ms);

      try {
        const currentTime = p.getCurrentTime?.() ?? 0;
        const currentState = p.getPlayerState?.() ?? -1;
        if (live && Number.isFinite(targetPos) && desiredPlaying && ra.position_sec < 8) {
          targetPos = remediateLiveStaleServerSeekTarget(
            p,
            desiredPlaying,
            ra.position_sec,
            targetPos,
            currentTime,
          );
        }
        const isCurrentlyPlaying = currentState === 1;
        const targetFinite = Number.isFinite(targetPos);
        const diff = targetFinite ? Math.abs(currentTime - targetPos) : Number.POSITIVE_INFINITY;
        const seekThreshold = opts?.forceSeek ? 0.12 : APPLY_SEEK_THRESHOLD_SEC;
        const needSeek = diff > seekThreshold;
        const deferSeek = needSeek && opts?.deferSeekWhileBuffering && currentState === YT_BUFFERING;
        const needPlay = desiredPlaying && !isCurrentlyPlaying && currentState !== YT_BUFFERING;
        const needPause = !desiredPlaying && isCurrentlyPlaying;

        if ((!needSeek || deferSeek) && !needPlay && !needPause) return;

        markApplyingRemote(opts?.guardMs);
        const didSeek = needSeek && !deferSeek;
        if (didSeek) {
          let seekArg: number = targetFinite ? targetPos : Number.MAX_SAFE_INTEGER;
          if (targetFinite && live && desiredPlaying) {
            try {
              const cap = liveStreamTimelineCap(p);
              if (
                Number.isFinite(cap) &&
                cap < Number.MAX_SAFE_INTEGER / 4 &&
                targetPos >= cap - LIVE_GO_SEEK_MAX_BELOW_CAP_SEC
              ) {
                seekArg = Number.MAX_SAFE_INTEGER;
              }
            } catch {
              /* ignore */
            }
          }
          p.seekTo(seekArg, true);
        }
        if (needPlay) p.playVideo();
        else if (needPause) p.pauseVideo();

        lastPlayerTickRef.current = {
          at: Date.now(),
          pos: didSeek && targetFinite ? targetPos : currentTime,
          playing: desiredPlaying,
        };
      } catch {
        // ignore
      }
    },
    [markApplyingRemote],
  );

  /** Ref para usar dentro do polling sem prender deps. */
  const applyPlaybackFromStateRef = useRef(applyPlaybackFromState);
  useEffect(() => {
    applyPlaybackFromStateRef.current = applyPlaybackFromState;
  }, [applyPlaybackFromState]);

  /**
   * Último estado play/pause que o host (próprio cliente) já comunicou ao servidor.
   * O `onStateChange` do host só broadcasta quando o flag muda, evitando duplicações
   * causadas por buffering/repetição de eventos PLAYING/PAUSED do iframe.
   */
  const lastBroadcastPlayingRef = useRef<boolean | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [roomAmbienceMessages.length]);

  useEffect(() => {
    if (!playerFloatChatOpen) return;
    const id = requestAnimationFrame(() => {
      floatChatEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
    return () => cancelAnimationFrame(id);
  }, [roomAmbienceMessages.length, playerFloatChatOpen]);

  useEffect(() => {
    if (!entered || !roomAmbience.active || !roomAmbience.video_id) return;
    let cancelled = false;
    void loadYoutubeIframeApi().then(() => {
      if (cancelled || !mountRef.current) return;
      mountRef.current.innerHTML = "";
      const w = window as Window & {
        YT?: { Player: new (el: HTMLElement | string, opts: unknown) => YtPlayer };
      };
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      playerRef.current = new w.YT!.Player(mountRef.current, {
        height: "100%",
        width: "100%",
        videoId: roomAmbience.video_id,
        playerVars: {
          /**
           * Todo mundo agora tem controls completos no próprio player. Ações do
           * viewer ficam locais (mode "independent" auto-ativado em onStateChange);
           * ações do host são propagadas via onStateChange + heurística de seek.
           */
          playsinline: 1,
          rel: 0,
          controls: 1,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          enablejsapi: 1,
          origin,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            const p = playerRef.current;
            if (!p) return;
            try {
              p.setVolume(localVolume);
            } catch {
              /* ignore */
            }
            /**
             * Inicializa o último broadcast de play/pause com o estado da sala —
             * assim o primeiro `onStateChange` (PLAYING/PAUSED da inicialização)
             * não rebroadcasta o que já é o estado conhecido.
             */
            lastBroadcastPlayingRef.current = roomAmbienceRef.current.playing;
            if (!amHostRef.current) {
              applyPlaybackFromStateRef.current?.();
            }
            /**
             * Espectador: uma hidratação com o estado já na sala (sem pedir âncora ao host).
             * Novos seeks do host chegam com novo `sync_epoch_ms` e disparam o useEffect.
             * Garante que o iframe possa receber foco do teclado.
             */
            try {
              const iframe = p.getIframe?.() ?? mountRef.current?.querySelector("iframe");
              if (iframe instanceof HTMLIFrameElement) {
                if (!iframe.hasAttribute("tabindex")) iframe.setAttribute("tabindex", "0");
              }
            } catch {
              /* ignore */
            }
          },
          onStateChange: (e: { data: number }) => {
            const state = e.data;
            // Só play (1) e pause (2) sinalizam intenção do usuário aqui.
            // BUFFERING (3) / CUED (5) / UNSTARTED (-1) / ENDED (0) são ruidosos demais.
            if (state !== 1 && state !== 2) return;
            const p = playerRef.current;
            if (!p) return;
            const isHost = amHostRef.current;
            const cur = p.getCurrentTime?.() ?? 0;
            const isPlaying = state === 1;

            if (isHost) {
              /**
               * Mantemos o tick atualizado sempre — assim o polling não enxerga
               * "salto" quando o iframe re-emite PLAYING depois de um buffering pós-seek.
               */
              lastPlayerTickRef.current = { at: Date.now(), pos: cur, playing: isPlaying };
              /**
               * Só broadcasta quando o play/pause realmente flipou desde o último
               * broadcast. Isso evita duplicações com `hostControl`/teclado (que já
               * broadcasteam explicitamente) e cobre o caso do host pausar via
               * controles nativos do YouTube mesmo durante a janela de guarda.
               */
              if (lastBroadcastPlayingRef.current === isPlaying) return;
              lastBroadcastPlayingRef.current = isPlaying;
              sendRoomAmbienceRef.current({
                action: isPlaying ? "play" : "pause",
                position_sec: cur,
              });
              return;
            }

            // Viewer: ignora dentro da janela de guarda (estamos aplicando estado do host)…
            if (Date.now() < applyingRemoteUntilRef.current) return;
            /**
             * …ou se o estado já casa com o que o host quer. Esse fallback cobre o caso
             * de buffering longo em que a guarda expirou antes do iframe terminar de
             * processar a aplicação remota.
             */
            const hostState = roomAmbienceRef.current;
            if (
              (state === 1 && hostState.playing) ||
              (state === 2 && !hostState.playing)
            ) {
              return;
            }
            if (syncModeRef.current === "synced") setSyncMode("independent");
          },
        },
      });
    });
    return () => {
      cancelled = true;
      if (manualSyncOnceTimerRef.current) {
        window.clearTimeout(manualSyncOnceTimerRef.current);
        manualSyncOnceTimerRef.current = 0;
      }
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
      if (mountRef.current) mountRef.current.innerHTML = "";
      lastPlayerTickRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Player só deve recriar quando vídeo ou estado da sala muda; `localVolume`/`markApplyingRemote`/`setSyncMode` são estáveis ou usados via ref.
  }, [entered, roomAmbience.active, roomAmbience.video_id]);

  /**
   * O host é a fonte da verdade — nunca aplicamos estado vindo do servidor no
   * próprio player do host (evita reverter ações dele com a latência do broadcast).
   * Viewers em modo "synced" aplicam seek/play/pause do host quando o servidor publica
   * novo `sync_epoch_ms`; em modo "independent" ignoram para o player ficar local.
   */
  useEffect(() => {
    if (amHost) return;
    if (syncMode !== "synced") return;
    applyPlaybackFromState();
  }, [
    amHost,
    syncMode,
    applyPlaybackFromState,
    roomAmbience.active,
    roomAmbience.video_id,
    roomAmbience.sync_epoch_ms,
  ]);

  /**
   * Quando o host troca o vídeo, espectadores voltam a seguir o estado publicado
   * (novo vídeo = nova linha do tempo; o player recria e pede âncora de novo).
   */
  useEffect(() => {
    const currentVideoId = roomAmbience.video_id;
    if (!currentVideoId) {
      lastAppliedVideoIdRef.current = "";
      return;
    }
    if (lastAppliedVideoIdRef.current === currentVideoId) return;
    lastAppliedVideoIdRef.current = currentVideoId;
    if (amHostRef.current) return;
    setSyncMode("synced");
  }, [roomAmbience.video_id, setSyncMode]);

  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.setVolume(localVolume);
      if (localVolume === 0) p.mute();
      else p.unMute();
    } catch {
      // ignore
    }
  }, [localVolume]);

  /**
   * Polling do player (intervalo um pouco mais lento em tela cheia no viewer).
   *
   * 1) Seek grande no host → broadcast seek.
   * 2) Drift para o badge (≥ 2s = fora de sincronia).
   */
  useEffect(() => {
    if (!entered || !roomAmbience.active || !roomAmbience.video_id) return;
    let cancelled = false;
    let timeoutId = 0;

    const isBrowserFullscreenHeavy = () => {
      if (typeof document === "undefined") return false;
      const fs = document.fullscreenElement;
      if (!fs) return false;
      return fs === shellRef.current || fs === playerStageRef.current;
    };

    const scheduleNext = (delayMs: number) => {
      timeoutId = window.setTimeout(tick, delayMs);
    };

    const tick = () => {
      if (cancelled) return;
      const nextDelayBaseRaw =
        !amHostRef.current && isBrowserFullscreenHeavy() ? 1250 : 520;
      const ui = panelLoadRef.current;
      const overlayHeavy =
        !amHostRef.current &&
        (ui.chatOpen ||
          ui.playerFloatChatOpen ||
          ui.participantsOpen ||
          ui.playerFloatParticipantsOpen ||
          ui.settingsOpen);
      const nextDelayBase = Math.round(nextDelayBaseRaw * (overlayHeavy ? 2 : 1));

      const p = playerRef.current;
      if (!p?.getCurrentTime || !p.getPlayerState) {
        scheduleNext(nextDelayBase);
        return;
      }

      let actual: number;
      let playerState: number;
      try {
        actual = p.getCurrentTime();
        playerState = p.getPlayerState();
      } catch {
        scheduleNext(nextDelayBase);
        return;
      }

      const now = Date.now();
      const last = lastPlayerTickRef.current;
      const inGuard = now < applyingRemoteUntilRef.current;

      if (last) {
        const elapsed = (now - last.at) / 1000;
        const expectedFromLast = last.playing ? last.pos + elapsed : last.pos;
        const jump = actual - expectedFromLast;

        if (amHostRef.current) {
          const mx = isLivePlayer(p) ? liveMaxSeekSeconds(p) : null;
          const jumpedToLiveEdge =
            mx != null &&
            last.pos < mx - LIVE_HOST_EDGE_JUMP_BACK_MIN_SEC &&
            actual >= mx - LIVE_HOST_EDGE_JUMP_TOLERANCE_SEC;

          if (Math.abs(jump) > SEEK_JUMP_THRESHOLD_SEC || jumpedToLiveEdge) {
            let pos = Math.max(0, actual);
            if (isLivePlayer(p)) {
              const mx2 = liveMaxSeekSeconds(p);
              if (mx2 != null && pos > mx2 + 0.05) {
                pos = mx2;
                markApplyingRemote();
                try {
                  p.seekTo(pos, true);
                } catch {
                  /* ignore */
                }
              }
            }
            sendRoomAmbienceRef.current({
              action: "seek",
              position_sec: pos,
            });
          }
        } else if (!inGuard) {
          const liveForJump = isLivePlayer(p);
          const jumpTh = liveForJump ? LIVE_VIEWER_JUMP_THRESHOLD_SEC : SEEK_JUMP_THRESHOLD_SEC;
          if (Math.abs(jump) > jumpTh && syncModeRef.current === "synced") {
            const sinceEpoch = Date.now() - hostPlaybackEpochChangedAtMsRef.current;
            if (
              hostPlaybackEpochChangedAtMsRef.current > 0 &&
              sinceEpoch < VIEWER_JUMP_IGNORE_INDEP_MS_AFTER_SYNC_EPOCH
            ) {
              /* salto provável do host / Sincronizar — não forçar modo independente */
            } else {
              setSyncMode("independent");
            }
          }
        }
      }

      const playing = playerState === 1;
      lastPlayerTickRef.current = { at: now, pos: actual, playing };

      if (amHostRef.current) {
        scheduleNext(nextDelayBase);
        return;
      }

      const hs = roomAmbienceRef.current;
      const live = isLivePlayer(p);

      let newDrift: number;
      if (live) {
        let capDrift: number | null = null;
        try {
          const c = liveStreamTimelineCap(p);
          if (Number.isFinite(c) && c < Number.MAX_SAFE_INTEGER / 4) capDrift = c;
        } catch {
          /* ignore */
        }
        let actualForDrift = actual;
        if (capDrift != null) {
          actualForDrift = Math.min(actual, capDrift + LIVE_STREAM_EDGE_EPS_SEC);
        }
        let hostOnTimeline = liveViewerTargetSeconds(
          p,
          hs.playing,
          hs.position_sec,
          hs.sync_epoch_ms,
        );
        if (
          hs.playing &&
          hs.position_sec < 8 &&
          Number.isFinite(hostOnTimeline)
        ) {
          hostOnTimeline = remediateLiveStaleServerSeekTarget(
            p,
            hs.playing,
            hs.position_sec,
            hostOnTimeline,
            actualForDrift,
          );
        }
        newDrift = Number.isFinite(hostOnTimeline) ? actualForDrift - hostOnTimeline : 0;
      } else {
        const hostExpected = computeSyncedSeconds(
          hs.playing,
          hs.position_sec,
          hs.sync_epoch_ms,
        );
        newDrift = actual - hostExpected;
      }

      const driftMin = playerState === YT_BUFFERING ? 0.12 : DRIFT_UPDATE_THRESHOLD_SEC;
      setDriftSec((prev) => (Math.abs(prev - newDrift) < driftMin ? prev : newDrift));

      scheduleNext(nextDelayBase);
    };

    scheduleNext(160);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [entered, roomAmbience.active, roomAmbience.video_id, setSyncMode, markApplyingRemote]);

  /** Fecha o popover de configurações ao clicar fora dele. */
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (settingsPanelRef.current?.contains(target)) return;
      if (settingsTriggerRef.current?.contains(target)) return;
      setSettingsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen]);

  /**
   * Atalhos de teclado para o player — ←/→ ±5s, J/L ±10s, Espaço/K play/pause.
   * O YouTube iframe responde nativamente quando focado, mas o foco costuma cair
   * em botões custom (gear, layouts) após interagir, deixando as setas sem efeito.
   * Este handler só dispara fora de inputs/textareas para não brigar com o chat.
   *
   * Estratégia:
   *  - Host: marca aplicação remota antes do `seekTo`/`playVideo`/`pauseVideo`,
   *    atualiza `lastPlayerTickRef` e faz UM broadcast atômico — evita que
   *    `onStateChange`/polling também broadcastem (causaria duplicação).
   *  - Viewer: apenas seek/play/pause local; o polling/onStateChange detecta a
   *    ação e move o `syncMode` para "independent" de forma natural.
   */
  useEffect(() => {
    if (!entered || !roomAmbience.active || !roomAmbience.video_id) return;
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      if (active) {
        const tag = active.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (active.isContentEditable) return;
      }
      const p = playerRef.current;
      if (!p) return;

      let seekDelta: number | null = null;
      let togglePlay = false;
      if (e.key === "ArrowLeft") seekDelta = -5;
      else if (e.key === "ArrowRight") seekDelta = 5;
      else if (e.key === "j" || e.key === "J") seekDelta = -10;
      else if (e.key === "l" || e.key === "L") seekDelta = 10;
      else if (e.key === " " || e.key === "k" || e.key === "K") togglePlay = true;
      if (seekDelta === null && !togglePlay) return;
      e.preventDefault();

      const isHost = amHostRef.current;
      try {
        if (seekDelta !== null) {
          const cur = p.getCurrentTime?.() ?? 0;
          let newPos = Math.max(0, cur + seekDelta);
          if (isLivePlayer(p)) {
            const mx = liveMaxSeekSeconds(p);
            if (mx != null) {
              newPos = Math.min(newPos, mx);
            }
          }
          if (isHost) {
            markApplyingRemote();
            p.seekTo(newPos, true);
            lastPlayerTickRef.current = {
              at: Date.now(),
              pos: newPos,
              playing: lastPlayerTickRef.current?.playing ?? false,
            };
            sendRoomAmbienceRef.current({ action: "seek", position_sec: newPos });
          } else {
            p.seekTo(newPos, true);
          }
        } else if (togglePlay) {
          const state = p.getPlayerState?.() ?? -1;
          const cur = p.getCurrentTime?.() ?? 0;
          const wantPlay = state !== 1;
          if (isHost) {
            if (wantPlay) p.playVideo();
            else p.pauseVideo();
            lastBroadcastPlayingRef.current = wantPlay;
            lastPlayerTickRef.current = {
              at: Date.now(),
              pos: cur,
              playing: wantPlay,
            };
            sendRoomAmbienceRef.current({
              action: wantPlay ? "play" : "pause",
              position_sec: cur,
            });
          } else {
            if (wantPlay) p.playVideo();
            else p.pauseVideo();
          }
        }
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [entered, roomAmbience.active, roomAmbience.video_id, markApplyingRemote]);

  const createTransmission = async () => {
    clearRoomAmbienceError();
    const id = extractYoutubeVideoId(createUrl.trim());
    if (!id) return;
    setBusy(true);
    try {
      const meta = await fetchYoutubeOEmbedMeta(id);
      sendRoomAmbience({
        action: "create",
        video_id: id,
        title: meta.title,
        channel_name: meta.channelName,
        channel_url: meta.channelUrl,
        channel_thumbnail: meta.channelThumbnail,
        channel_avatar_url: meta.channelAvatarUrl,
      });
      setCreateUrl("");
    } finally {
      setBusy(false);
    }
  };

  const changeTransmissionVideo = async () => {
    clearRoomAmbienceError();
    const id = extractYoutubeVideoId(changeUrl.trim());
    if (!id) return;
    setBusy(true);
    try {
      const meta = await fetchYoutubeOEmbedMeta(id);
      sendRoomAmbience({
        action: "change_video",
        video_id: id,
        title: meta.title,
        channel_name: meta.channelName,
        channel_url: meta.channelUrl,
        channel_thumbnail: meta.channelThumbnail,
        channel_avatar_url: meta.channelAvatarUrl,
      });
      setChangeUrl("");
    } finally {
      setBusy(false);
    }
  };

  const sendComment = () => {
    const body = chatText.trim();
    if (!body) return;
    sendRoomAmbience({ action: "send_message", body });
    setChatText("");
  };

  /**
   * Controles do host (botões -10/+10/Play/Pause). Aplica a ação localmente
   * de forma otimista (para que o host veja a mudança imediatamente, sem esperar
   * o round-trip do servidor) E faz broadcast pra que os viewers sincronizem.
   * Como o useEffect que aplica estado do servidor é gated com `if (amHost) return`,
   * sem essa aplicação local o player do host não respondia aos próprios botões.
   */
  const hostControl = (kind: "play" | "pause" | "seek", deltaSec = 0) => {
    const p = playerRef.current;
    if (!p || !amHost) return;
    const cur = p.getCurrentTime?.() ?? 0;
    let newPos = cur;
    if (kind === "seek") {
      const live = isLivePlayer(p);
      if (live) {
        const mx = liveMaxSeekSeconds(p);
        newPos = Math.max(0, cur + deltaSec);
        if (mx != null) {
          newPos = Math.min(newPos, mx);
        }
      } else {
        newPos = Math.max(0, cur + deltaSec);
      }
    }
    try {
      if (kind === "play") {
        p.playVideo();
        lastBroadcastPlayingRef.current = true;
      } else if (kind === "pause") {
        p.pauseVideo();
        lastBroadcastPlayingRef.current = false;
      } else if (kind === "seek") {
        p.seekTo(newPos, true);
      }
      lastPlayerTickRef.current = {
        at: Date.now(),
        pos: kind === "seek" ? newPos : cur,
        playing:
          kind === "pause"
            ? false
            : kind === "play"
              ? true
              : (lastPlayerTickRef.current?.playing ?? false),
      };
    } catch {
      /* ignore */
    }
    if (kind === "play") sendRoomAmbience({ action: "play", position_sec: cur });
    else if (kind === "pause") sendRoomAmbience({ action: "pause", position_sec: cur });
    else if (kind === "seek") sendRoomAmbience({ action: "seek", position_sec: newPos });
  };

  /** Pede âncora ao host; um único seek após a sala atualizar (evita “disco garrado”). */
  const handleManualSync = useCallback(() => {
    if (amHostRef.current) return;
    if (manualSyncOnceTimerRef.current) {
      window.clearTimeout(manualSyncOnceTimerRef.current);
      manualSyncOnceTimerRef.current = 0;
    }
    sendRoomAmbienceRef.current({ action: "request_playback_anchor" });
    setSyncMode("synced");
    manualSyncOnceTimerRef.current = window.setTimeout(() => {
      manualSyncOnceTimerRef.current = 0;
      markApplyingRemote(REMOTE_APPLY_GUARD_MS);
      applyPlaybackFromStateRef.current?.({
        forceSeek: true,
        deferSeekWhileBuffering: true,
        guardMs: REMOTE_APPLY_GUARD_MS,
      });
    }, 500);
  }, [markApplyingRemote, setSyncMode]);

  const onVolumeRange = (v: number) => {
    const next = Math.max(0, Math.min(100, Math.round(v)));
    setLocalVolume(next);
    if (next > 0) preMuteVolumeRef.current = next;
  };

  const toggleMuteIcon = () => {
    if (localVolume > 0) {
      preMuteVolumeRef.current = localVolume;
      setLocalVolume(0);
    } else {
      setLocalVolume(preMuteVolumeRef.current > 0 ? preMuteVolumeRef.current : 80);
    }
  };

  const setLayoutMode = (m: ViewMode) => {
    const shellEl = shellRef.current;
    const playerEl = playerStageRef.current;
    const fs = document.fullscreenElement;
    const alreadyMatches =
      m === viewMode &&
      ((m === "small" && !fs) ||
        (m === "cinema" && fs === shellEl) ||
        (m === "fullplayer" && fs === playerEl));
    if (alreadyMatches) return;

    void (async () => {
      programmaticFsRef.current = true;
      programmaticModeTargetRef.current = m;
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          programmaticFsRef.current = false;
          programmaticModeTargetRef.current = null;
          setViewMode(m);
          queueMicrotask(() => setLayoutPulse((c) => c + 1));
        }
      } catch {
        programmaticFsRef.current = false;
        programmaticModeTargetRef.current = null;
        setViewMode(m);
        queueMicrotask(() => setLayoutPulse((c) => c + 1));
      }
    })();
  };

  /** Já em Cinema (ex.: após Esc no player): voltar a fullscreen do painel sem mudar o estado. */
  const enterCinemaLayout = () => {
    if (viewMode === "cinema" && document.fullscreenElement === shellRef.current) return;
    if (viewMode === "cinema" && !document.fullscreenElement) {
      void shellRef.current?.requestFullscreen().catch(() => {});
      return;
    }
    setLayoutMode("cinema");
  };

  const enterFullPlayerLayout = () => {
    if (viewMode === "fullplayer" && document.fullscreenElement === playerStageRef.current) return;
    if (viewMode === "fullplayer" && !document.fullscreenElement) {
      void playerStageRef.current?.requestFullscreen().catch(() => {});
      return;
    }
    setLayoutMode("fullplayer");
  };

  if (!roomAmbience.active) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-xl font-bold">Modo Ambiente (Watchparty YouTube)</h2>
        <p className="max-w-xl text-center text-sm text-muted-foreground">
          Inicie uma transmissão com link do YouTube. Apenas quem iniciar poderá
          controlar reprodução; espectadores controlam apenas volume local.
        </p>
        <div className="flex w-full max-w-xl gap-2">
          <input
            value={createUrl}
            onChange={(e) => setCreateUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
          />
          <Button disabled={busy} onClick={() => void createTransmission()}>
            Iniciar
          </Button>
        </div>
        {roomAmbienceError ? <p className="text-sm text-destructive">{roomAmbienceError}</p> : null}
      </div>
    );
  }

  if (!entered) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-600 dark:text-red-400">
          <YoutubeMark className="h-3.5 w-4 shrink-0 text-[#FF0033]" />
          Transmissão YouTube
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-500">
          <Radio className="h-3.5 w-3.5" /> Ao vivo
        </span>
        <h2 className="max-w-2xl text-center text-xl font-bold">{roomAmbience.title || "Transmissão ao vivo"}</h2>
        <a
          href={channelHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md px-1 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={channelImg}
            alt=""
            className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-border"
          />
          <span className="max-w-[220px] truncate">{channelLabel}</span>
        </a>
        <p className="text-sm text-muted-foreground">
          {roomAmbience.host_username ? `Host da sala: ${roomAmbience.host_username}` : "Modo Ambiente"}
        </p>
        <p className="text-sm font-medium text-foreground">
          {watchingNowLabel(roomAmbience.viewers.length)}
        </p>
        <Button size="lg" className="px-5" onClick={() => onEnteredChange(true)}>
          Entrar na transmissão
        </Button>
      </div>
    );
  }

  const playerStageClass = cn(
    "relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-black",
    viewMode === "small" &&
      "min-h-[min(52vh,420px)] w-full shrink-0 md:min-h-[min(48vh,520px)] md:flex-1",
    (viewMode === "cinema" || viewMode === "fullplayer") &&
      "min-h-[min(52vh,560px)] w-full flex-1 md:min-h-0",
    viewMode === "fullplayer" && "md:rounded-xl",
  );

  const mainRowClass = cn(
    "flex min-h-0 flex-1 flex-col gap-3 md:flex-row md:items-stretch md:gap-3",
  );

  const chatColumnClass = cn(
    "order-3 flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-border/60 bg-card md:max-w-[400px]",
    (!chatOpen || playerIsFs) && "hidden",
  );

  return (
    <div
      ref={shellRef}
      className={cn(
        "flex h-full min-h-0 w-full flex-col gap-3 p-3 md:p-4",
        viewMode === "cinema" && "min-h-[min(92dvh,100%)] flex-1",
        viewMode === "small" && "min-h-0 flex-1",
        viewMode === "fullplayer" && "min-h-0 flex-1",
      )}
    >
      <div className="flex shrink-0 flex-col gap-3 border-b border-border/50 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/35 bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
            <YoutubeMark className="h-3 w-4 shrink-0 text-[#FF0033]" />
            Transmissão YouTube
          </span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => onEnteredChange(false)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Sair da transmissão
            </Button>
            {amHost ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setChangeUrl("");
                    setChangeVideoOpen(true);
                  }}
                >
                  Trocar vídeo
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8"
                  onClick={() => setConfirmCloseOpen(true)}
                >
                  Encerrar
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <a
            href={youtubeWatchUrl(roomAmbience.video_id)}
            target="_blank"
            rel="noopener noreferrer"
            className="line-clamp-2 text-base font-bold text-foreground underline-offset-2 hover:text-primary hover:underline"
          >
            {roomAmbience.title}
          </a>
          <a
            href={channelHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={channelImg}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-border"
            />
            <span className="max-w-[220px] truncate">{channelLabel}</span>
          </a>
        </div>

        {!chatOpen && roomAmbience.host_username ? (
          <Link
            href={`/profile/${encodeURIComponent(roomAmbience.host_username)}`}
            className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <ProfileAvatar
              displayName={roomAmbience.host_username}
              username={roomAmbience.host_username}
              profilePhoto={roomAmbience.host_profile_photo}
              sizeClass="h-7 w-7"
              fallbackTextClassName="text-[10px]"
            />
            <span>
              Host da sala:{" "}
              <span className="font-semibold text-foreground">{roomAmbience.host_username}</span>
            </span>
          </Link>
        ) : null}
      </div>

      <div className={cn(mainRowClass, "relative")}>
        <div ref={playerStageRef} className={cn(playerStageClass, "order-2")}>
          <div className="relative min-h-0 flex-1 overflow-hidden [contain:layout_paint] [isolation:isolate]">
            <div
              ref={mountRef}
              className="absolute inset-0 h-full w-full"
            />
            <div
              className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 shadow-md ring-1 ring-white/15"
              aria-hidden
            >
              <YoutubeMark className="h-4 w-5 shrink-0 text-[#FF0033]" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/90">YouTube</span>
            </div>
            {playerIsFs && playerFloatParticipantsOpen ? (
              <div
                className={cn(
                  "pointer-events-auto absolute bottom-[3.35rem] left-2 z-[35] flex max-h-[min(42vh,320px)] w-[min(92vw,280px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-black text-foreground shadow-2xl ring-1 ring-white/5 sm:left-3",
                  "[contain:layout]",
                )}
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-black px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5 text-zinc-100">
                    <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate text-[10px] font-bold uppercase tracking-wide">
                      Na transmissão
                    </span>
                    <span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-50">
                      {roomAmbience.viewers.length}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-zinc-100 hover:bg-white/10 hover:text-white"
                    title="Fechar"
                    onClick={() => setPlayerFloatParticipantsOpen(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-black px-2 py-2">
                  {roomAmbience.viewers.length > 0 ? (
                    roomAmbience.viewers.map((participant) => (
                      <div
                        key={participant.user_id}
                        className="flex items-center gap-2 rounded-lg border border-white/20 bg-black px-2 py-2 shadow-sm shadow-black/40 ring-1 ring-white/5 [contain:content]"
                      >
                        <ProfileAvatar
                          displayName={participant.fullname || participant.username}
                          username={participant.username}
                          profilePhoto={participant.profile_photo}
                          sizeClass="h-8 w-8"
                          fallbackTextClassName="text-[10px]"
                          className="ring-1 ring-white/25"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-zinc-50">
                            {participant.fullname || participant.username}
                          </p>
                          <p className="truncate text-[11px] text-zinc-400">@{participant.username}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400">Ninguém na transmissão agora.</p>
                  )}
                </div>
              </div>
            ) : null}
            {playerIsFs && playerFloatChatOpen ? (
              <div
                className={cn(
                  "pointer-events-auto absolute bottom-[3.35rem] left-2 right-2 z-[35] flex max-h-[min(42vh,340px)] flex-col overflow-hidden rounded-xl border border-white/10 bg-black text-foreground shadow-2xl ring-1 ring-white/5 sm:left-auto sm:right-3 sm:w-[min(92vw,380px)]",
                  "[contain:layout]",
                )}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5 text-zinc-100">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span className="truncate text-[10px] font-bold uppercase tracking-wide">
                      Chat da Room
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-100 hover:bg-white/10 hover:text-white"
                    title="Fechar chat"
                    onClick={() => setPlayerFloatChatOpen(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden bg-black px-2 py-2">
                  {floatChatMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-2 py-4 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-50">
                        Nenhuma mensagem ainda
                      </p>
                      <p className="text-xs leading-snug text-zinc-400">
                        Quebra o gelo! Envie a primeira mensagem para começar a conversa.
                      </p>
                    </div>
                  ) : (
                    floatChatMessages.map((m) => (
                      <AmbienceChatLine key={m.id} m={m} variant="float" />
                    ))
                  )}
                  <div ref={floatChatEndRef} />
                </div>
                <div className="flex shrink-0 gap-2 border-t border-white/10 bg-black p-2">
                  <input
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black px-3 py-2 text-sm text-zinc-50 placeholder:text-zinc-500 focus:border-primary/60 focus:outline-none"
                    placeholder="Comentar…"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), sendComment())}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 border border-white/15 bg-black text-zinc-100 hover:bg-white/10 hover:text-white"
                    onClick={sendComment}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-black/80 px-2 py-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {amHost ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                    Você é o host
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => hostControl("play")}
                  >
                    Play
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => hostControl("pause")}
                  >
                    Pause
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => hostControl("seek", -10)}
                  >
                    -10s
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => hostControl("seek", 10)}
                  >
                    +10s
                  </Button>
                </>
              ) : (
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {syncMode === "synced" && viewerTimelineAligned ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200"
                      title="Sua posição na timeline está a menos de 2s da do host"
                    >
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                      Ao vivo com host
                    </span>
                  ) : syncMode === "synced" ? (
                    <>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/55 bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-100"
                        title="Seguindo o host; a timeline ainda difere — use Sincronizar se quiser alinhar"
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-amber-300" />
                        Acompanhando o host
                      </span>
                      {Math.abs(driftSec) >= 0.5 ? (
                        <span className="hidden text-[11px] font-medium text-white/70 sm:inline">
                          {formatDriftOffsetOnly(driftSec)}
                        </span>
                      ) : null}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-1.5 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        onClick={handleManualSync}
                        title="Sincronizar com o tempo atual do host"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sincronizar
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-100"
                        title="Controle local do player — use Sincronizar para voltar a seguir o host"
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-zinc-300" />
                        Modo independente
                      </span>
                      {Math.abs(driftSec) >= 0.5 ? (
                        <span className="hidden text-[11px] font-medium text-white/70 sm:inline">
                          {formatDriftOffsetOnly(driftSec)}
                        </span>
                      ) : null}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-1.5 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                        onClick={handleManualSync}
                        title="Sincronizar com o tempo atual do host"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Sincronizar
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center justify-end gap-1">
                <div className="flex gap-0.5 md:hidden">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    title={
                      participantsPanelHighlighted ? "Ocultar participantes" : "Participantes na transmissão"
                    }
                    className={cn(
                      "relative h-8 w-8 border-white/25 bg-black/40 text-white hover:bg-white/15 hover:text-white",
                      participantsPanelHighlighted && "border-primary/60 bg-primary/25",
                    )}
                    onClick={toggleParticipantsPanel}
                  >
                    <Users className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    title={
                      playerIsFs
                        ? playerFloatChatOpen
                          ? "Ocultar chat"
                          : "Chat flutuante"
                        : chatOpen
                          ? "Ocultar chat"
                          : "Mostrar chat"
                    }
                    className={cn(
                      "relative h-8 w-8 border-white/25 bg-black/40 text-white hover:bg-white/15 hover:text-white",
                      chatPanelHighlighted && "border-primary/60 bg-primary/25",
                    )}
                    onClick={toggleChatPanel}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    {playerIsFs ? <ChatFloatUnreadBadge count={floatChatUnreadCount} /> : null}
                  </Button>
                </div>
                {playerIsFs ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        "relative hidden h-8 gap-1 border-white/25 bg-black/40 px-2 text-xs text-white hover:bg-white/15 hover:text-white md:inline-flex",
                        playerFloatParticipantsOpen && "border-primary/60 bg-primary/25",
                      )}
                      title="Participantes flutuante sobre o vídeo"
                      onClick={toggleParticipantsPanel}
                    >
                      <Users className="h-3.5 w-3.5" />
                      Participantes
                      <span className="ml-1 rounded-md bg-white/15 px-1 py-0.5 text-[10px] font-semibold tabular-nums">
                        {roomAmbience.viewers.length}
                      </span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className={cn(
                        "relative hidden h-8 gap-1 border-white/25 bg-black/40 px-2 text-xs text-white hover:bg-white/15 hover:text-white md:inline-flex",
                        playerFloatChatOpen && "border-primary/60 bg-primary/25",
                      )}
                      title="Chat flutuante sobre o vídeo"
                      onClick={toggleChatPanel}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                      <ChatFloatUnreadBadge count={floatChatUnreadCount} />
                    </Button>
                  </>
                ) : null}
                {!amHost ? (
                  <div className="relative">
                    <Button
                      ref={settingsTriggerRef}
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-8 w-8 border-white/25 bg-black/40 text-white hover:bg-white/15 hover:text-white",
                        settingsOpen && "border-primary/60 bg-primary/25 text-white",
                      )}
                      title="Configurações da transmissão"
                      aria-haspopup="dialog"
                      aria-expanded={settingsOpen}
                      onClick={() => setSettingsOpen((o) => !o)}
                    >
                      <Settings className="h-3.5 w-3.5" />
                    </Button>
                    {settingsOpen ? (
                      <div
                        ref={settingsPanelRef}
                        role="dialog"
                        aria-label="Configurações da transmissão"
                        /**
                         * Posicionado inline (sem portal) para funcionar tanto em layout
                         * normal quanto dentro do elemento em fullscreen do player.
                         */
                        className="absolute bottom-full right-0 z-[60] mb-2 w-[280px] rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl ring-1 ring-black/10"
                      >
                        <div className="border-b border-border/50 px-3 py-2">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                            Sua transmissão
                          </p>
                          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                            O layout da sala fica salvo neste aparelho. Ao seguir o host, o player
                            alinha quando ele muda reprodução (seek, play ou pause).{" "}
                            <strong className="text-foreground">Sincronizar</strong> pede ao host o
                            tempo atual e ajusta quando a sala atualiza (sem corrigir sozinho só por
                            drift na timeline).
                          </p>
                        </div>
                        <div className="px-3 py-2 text-[11px] text-muted-foreground">
                          {syncMode === "synced" && viewerTimelineAligned ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Timeline: <strong className="text-foreground">menos de 2s</strong> em relação
                              ao host
                            </span>
                          ) : syncMode === "synced" ? (
                            <span className="inline-flex flex-wrap items-center gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Acompanhando o host —{" "}
                              <strong className="text-foreground">
                                {formatDriftOffsetOnly(driftSec)}
                              </strong>
                              <span className="text-muted-foreground"> — use Sincronizar se quiser alinhar</span>
                            </span>
                          ) : (
                            <span className="inline-flex flex-wrap items-center gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              Modo independente —{" "}
                              <strong className="text-foreground">
                                {formatDriftOffsetOnly(driftSec)}
                              </strong>
                              <span className="text-muted-foreground"> — use Sincronizar</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 gap-1 border-white/25 bg-black/40 px-2 text-xs text-white hover:bg-white/15 hover:text-white",
                    layoutHighlight === "small" && "border-primary/60 bg-primary/25 text-white",
                  )}
                  onClick={() => setLayoutMode("small")}
                  title="Pequena"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Pequena
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 gap-1 border-white/25 bg-black/40 px-2 text-xs text-white hover:bg-white/15 hover:text-white",
                    layoutHighlight === "cinema" && "border-primary/60 bg-primary/25 text-white",
                  )}
                  onClick={enterCinemaLayout}
                  title="Cinema"
                >
                  <Film className="h-3.5 w-3.5" />
                  Cinema
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8 gap-1 border-white/25 bg-black/40 px-2 text-xs text-white hover:bg-white/15 hover:text-white",
                    layoutHighlight === "fullplayer" && "border-primary/60 bg-primary/25 text-white",
                  )}
                  onClick={enterFullPlayerLayout}
                  title="Tela cheia"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Tela cheia
                </Button>
              </div>
              <div className="flex min-w-[140px] max-w-[200px] cursor-pointer items-center gap-2 border-l border-white/15 pl-2 sm:min-w-[160px] sm:max-w-none">
                <button
                  type="button"
                  onClick={toggleMuteIcon}
                  className="shrink-0 cursor-pointer rounded-md p-1.5 text-white/90 outline-none ring-offset-background transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/50"
                  title={localVolume === 0 ? "Restaurar volume" : "Silenciar"}
                  aria-label={localVolume === 0 ? "Restaurar volume" : "Silenciar"}
                >
                  {localVolume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={localVolume}
                  onChange={(e) => onVolumeRange(Number(e.target.value))}
                  className="h-1 w-full min-w-[72px] cursor-pointer accent-primary"
                  aria-label="Volume neste aparelho"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 md:flex">
          <div className="pointer-events-auto ml-0.5 flex flex-col gap-1 rounded-xl border border-white/20 bg-black/85 p-1 shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
            <Button
              type="button"
              size="icon"
              variant="outline"
              title={participantsPanelHighlighted ? "Recolher lista" : "Quem está assistindo"}
              className={cn(
                "h-9 w-9 border-white/25 bg-black/50 text-white hover:bg-white/15 hover:text-white",
                participantsPanelHighlighted && "border-primary/60 bg-primary/30 text-white",
              )}
              onClick={toggleParticipantsPanel}
            >
              {participantsPanelHighlighted ? <ChevronLeft className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="pointer-events-none absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 md:flex">
          <div className="pointer-events-auto mr-0.5 flex flex-col gap-1 rounded-xl border border-white/20 bg-black/85 p-1 shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
            <Button
              type="button"
              size="icon"
              variant="outline"
              title={
                playerIsFs
                  ? playerFloatChatOpen
                    ? "Recolher chat"
                    : "Chat flutuante"
                  : chatOpen
                    ? "Recolher chat"
                    : "Abrir chat"
              }
              className={cn(
                "relative h-9 w-9 border-white/25 bg-black/50 text-white hover:bg-white/15 hover:text-white",
                chatPanelHighlighted && "border-primary/60 bg-primary/30 text-white",
              )}
              onClick={toggleChatPanel}
            >
              {playerIsFs ? (
                playerFloatChatOpen ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )
              ) : chatOpen ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              {playerIsFs ? <ChatFloatUnreadBadge count={floatChatUnreadCount} /> : null}
            </Button>
          </div>
        </div>

        {participantsOpen && !playerIsFs ? (
          <div className="order-1 flex min-h-0 w-full shrink-0 flex-col rounded-xl border border-border/60 bg-card/95 shadow-sm md:order-none md:w-[260px]">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-2 py-2 md:px-3">
              <div className="flex min-w-0 flex-1 items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  title="Recolher painel"
                  onClick={() => setParticipantsOpen(false)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate text-xs font-semibold uppercase text-muted-foreground">
                  Na transmissão
                </span>
              </div>
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums">
                {roomAmbience.viewers.length}
              </span>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
              {roomAmbience.viewers.length > 0 ? (
                roomAmbience.viewers.map((participant) => (
                  <div key={participant.user_id} className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-2 py-2">
                    <ProfileAvatar
                      displayName={participant.fullname || participant.username}
                      username={participant.username}
                      profilePhoto={participant.profile_photo}
                      sizeClass="h-8 w-8"
                      fallbackTextClassName="text-[10px]"
                      className="ring-1 ring-border"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {participant.fullname || participant.username}
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">@{participant.username}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">Ninguém está assistindo a transmissão agora.</p>
              )}
            </div>
          </div>
        ) : null}

        {chatOpen ? (
          <div className={chatColumnClass}>
            <div className="shrink-0 border-b border-border/60">
              <div className="flex items-center justify-between gap-2 px-2 py-2 md:px-3">
                <div className="flex min-w-0 items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-xs font-semibold uppercase text-muted-foreground">Chat</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  title="Recolher chat"
                  onClick={() => setChatOpen(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {roomAmbience.host_username ? (
                <Link
                  href={`/profile/${encodeURIComponent(roomAmbience.host_username)}`}
                  className="flex items-center gap-2 border-t border-border/40 bg-muted/20 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/35 hover:text-foreground"
                >
                  <ProfileAvatar
                    displayName={roomAmbience.host_username}
                    username={roomAmbience.host_username}
                    profilePhoto={roomAmbience.host_profile_photo}
                    sizeClass="h-8 w-8"
                    fallbackTextClassName="text-[10px]"
                  />
                  <span className="min-w-0 leading-snug">
                    Host da sala:{" "}
                    <span className="font-semibold text-foreground">{roomAmbience.host_username}</span>
                  </span>
                </Link>
              ) : null}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
              {roomAmbienceMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-2 py-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Nenhuma mensagem ainda
                  </p>
                  <p className="text-xs leading-snug text-muted-foreground">
                    Quebra o gelo! Envie a primeira mensagem para começar a conversa.
                  </p>
                </div>
              ) : (
                roomAmbienceMessages.map((m) => (
                  <AmbienceChatLine key={m.id} m={m} />
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="shrink-0 flex gap-2 border-t border-border/60 p-2">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm"
                placeholder="Comentar..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), sendComment())}
              />
              <Button size="icon" onClick={sendComment}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {roomAmbienceError ? <p className="text-sm text-destructive">{roomAmbienceError}</p> : null}
      <AlertDialog open={confirmCloseOpen} onOpenChange={setConfirmCloseOpen}>
        <AlertDialogContent portalContainer={dialogPortal ?? undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle>Encerrar transmissão?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai parar o vídeo para todos da sala imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmCloseOpen(false);
                sendRoomAmbience({ action: "close" });
              }}
            >
              Encerrar para todos
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={changeVideoOpen}
        onOpenChange={(open) => {
          setChangeVideoOpen(open);
          if (!open) setChangeUrl("");
        }}
      >
        <AlertDialogContent portalContainer={dialogPortal ?? undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle>Trocar vídeo da transmissão</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-1 text-sm text-muted-foreground">
                <p>O vídeo atual será substituído para todos que estão na transmissão.</p>
                <Input
                  value={changeUrl}
                  onChange={(e) => setChangeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="bg-background"
                  autoFocus
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
            <Button
              type="button"
              disabled={busy || !extractYoutubeVideoId(changeUrl.trim())}
              onClick={() => {
                setChangeVideoOpen(false);
                void changeTransmissionVideo();
              }}
            >
              Aplicar novo vídeo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

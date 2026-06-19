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
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
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
  Settings,
  Users,
  Volume2,
  VolumeX,
  TvMinimalPlay,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import type { RoomAmbienceMessage } from "@/types/RoomAmbience";
import { deleteAmbienceMessage } from "@/actions/roomRolesActions";
import { canModerateMember } from "@/lib/roomPermissions";
import { RoomMemberModerationMenu } from "@/components/pages/rooms/RoomModerationMenus";
import {
  AmbienceChatEmptyState,
  AmbienceChatInput,
  AmbienceChatLine,
  AmbiencePinnedBanner,
  ambienceMessageIsSystem,
} from "@/components/pages/rooms/RoomAmbienceChat";
import {
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
  loadVideoById: (
    arg: { videoId: string; startSeconds?: number } | string,
  ) => void;
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

/** Janela maior ao entrar / Sincronizar (buffer do iframe costuma atrasar o seek). */
const VIEWER_ALIGN_GUARD_MS = 6200;

/** Retentativas só enquanto o seek ficou adiado por BUFFERING (evita “vários cliques” em Sincronizar). */
const VIEWER_ALIGN_RETRY_MS = 650;
const VIEWER_ALIGN_MAX_RETRIES = 8;

/** VOD: |drift| abaixo disto = alinhado na timeline. */
const DRIFT_MAX_ALIGNED_SEC_VOD = 1;

/** Live DVR: margem mais apertada (segundos absolutos variam entre iframes). */
const DRIFT_MAX_ALIGNED_SEC_LIVE = 0.65;

/** Leituras consecutivas estáveis antes do chip “Ao vivo com host”. */
const LIVE_ALIGNED_STABLE_POLLS = 3;
const VOD_ALIGNED_STABLE_POLLS = 2;

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

/**
 * Saltos enormes em live (DVR) após seek do host — só para ignorar na janela de graça
 * (`VIEWER_JUMP_IGNORE_INDEP_MS_AFTER_SYNC_EPOCH`), não para deteção de controlo do utilizador.
 */
const LIVE_VIEWER_JUMP_THRESHOLD_SEC = 22;

/** Salto na timeline do viewer que indica controlo local (barra, ±10s, etc.). */
const VIEWER_USER_CONTROL_JUMP_SEC = 1;

/** Host em live: republica âncora se o iframe divergir do estado extrapolado no servidor. */
const HOST_LIVE_HEARTBEAT_MIN_INTERVAL_MS = 2800;
const HOST_LIVE_HEARTBEAT_DRIFT_SEC = 0.45;

/** Só chama `seekTo` se estivermos mais longe que isto do alvo (VOD e live estável). */
const APPLY_SEEK_THRESHOLD_SEC = 1.15;

/**
 * Viewer a menos de N segundos do próprio live edge: drift positivo residual (< 1 s)
 * é suprimido — DVR offsets entre iframes geram jitter espúrio nessa faixa mínima.
 * Somente valores muito pequenos; para o comando go_live usa-se drift relativo ao edge.
 */
const LIVE_EDGE_AHEAD_CLAMP_SEC = 1;

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

/** Distância (s) do ponto atual à borda “ao vivo” do DVR neste iframe. */
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

type HostPlaybackSnapshot = {
  playing: boolean;
  position_sec: number;
  sync_epoch_ms: number;
  /** Presente quando o servidor propagou um comando go_live do host. */
  playback_command?: "go_live" | null;
};

/**
 * Drift real viewer vs host (sem remediação de `position_sec` stale — só para UI e modo).
 */
function computeViewerHostDriftSec(
  p: YtPlayer,
  hs: HostPlaybackSnapshot,
  actual: number,
): number {
  const live = isLivePlayer(p);
  if (live) {
    // Cap viewer's actual to live edge + eps so it doesn't appear "ahead" of DVR end.
    let actualCapped = actual;
    let capVal = Number.MAX_SAFE_INTEGER;
    try {
      const cap = liveStreamTimelineCap(p);
      if (Number.isFinite(cap) && cap < Number.MAX_SAFE_INTEGER / 4) {
        capVal = cap;
        actualCapped = Math.min(actual, cap + LIVE_STREAM_EDGE_EPS_SEC);
      }
    } catch {
      /* ignore */
    }

    // Para go_live: o host estava no live edge. O drift significativo é
    // quantos segundos o viewer está ATRÁS do próprio live edge — não a
    // comparação de posições absolutas entre dois iframes (que diferem).
    // Resultado negativo = viewer atrás do live; 0 = viewer ao vivo.
    if (
      hs.playback_command === "go_live" &&
      capVal < Number.MAX_SAFE_INTEGER / 4
    ) {
      return actualCapped - capVal;
    }

    const hostOnTimeline = liveViewerTargetSeconds(
      p,
      hs.playing,
      hs.position_sec,
      hs.sync_epoch_ms,
    );
    const rawDrift = Number.isFinite(hostOnTimeline)
      ? actualCapped - hostOnTimeline
      : 0;
    // Suprime falso "à frente" apenas quando viewer está praticamente no live edge
    // (< 1 s). DVR offsets entre iframes causam drift positivo espúrio nessa faixa.
    if (rawDrift > 0 && capVal < Number.MAX_SAFE_INTEGER / 4) {
      const distFromEdge = capVal - actualCapped;
      if (distFromEdge < LIVE_EDGE_AHEAD_CLAMP_SEC) return 0;
    }
    // positive = viewer ahead; negative = viewer behind (same sign as VOD)
    return rawDrift;
  }
  const hostExpected = computeSyncedSeconds(
    hs.playing,
    hs.position_sec,
    hs.sync_epoch_ms,
  );
  return actual - hostExpected;
}

/** Executa o equivalente ao botão “Ir ao vivo” do YouTube neste iframe. */
function applyGoLiveOnPlayer(p: YtPlayer, desiredPlaying: boolean): void {
  // Usar Number.MAX_SAFE_INTEGER e mais confiavel que calcular cap = getDuration() - eps:
  // a API do YouTube trata qualquer seek alem do fim como "ir ao live edge real",
  // evitando a imprecisao de getDuration() que fica alguns segundos atras do edge.
  p.seekTo(Number.MAX_SAFE_INTEGER, true);
  if (desiredPlaying) p.playVideo();
  else p.pauseVideo();
}

function hostNearLiveEdge(p: YtPlayer | null, positionSec: number): boolean {
  if (!p || !isLivePlayer(p)) return false;
  const mx = liveMaxSeekSeconds(p);
  if (mx == null) return false;
  return positionSec >= mx - LIVE_GO_SEEK_MAX_BELOW_CAP_SEC;
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
  if (!Number.isFinite(cap) || cap >= Number.MAX_SAFE_INTEGER / 4)
    return serverDerivedTimeline;
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
  return Boolean(m.is_system || !m.author_user_id);
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
        <p
          className={cn(
            "whitespace-pre-wrap",
            float ? "text-zinc-50" : "text-foreground",
          )}
        >
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
        className={cn(
          "mt-0.5 shrink-0 ring-1",
          float ? "ring-white/25" : "ring-border",
        )}
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[11px] font-semibold",
            float ? "text-zinc-100" : "text-foreground",
          )}
        >
          {m.author_username}
        </p>
        <p
          className={cn("text-sm", float ? "text-zinc-50" : "text-foreground")}
        >
          {m.body}
        </p>
      </div>
    </div>
  );
});

export default function RoomAmbiencePanel({
  roomSlug,
  roomOwnerId,
  entered,
  onEnteredChange,
  transmissionBanNotice = null,
}: {
  roomSlug: string;
  roomOwnerId: number;
  entered: boolean;
  onEnteredChange: (entered: boolean) => void;
  transmissionBanNotice?: string | null;
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
  const [replyTo, setReplyTo] = useState<RoomAmbienceMessage | null>(null);
  const [localVolume, setLocalVolume] = useState(80);
  const preMuteVolumeRef = useRef(80);
  const [chatOpen, setChatOpen] = useState(true);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [changeVideoOpen, setChangeVideoOpen] = useState(false);
  const [playerFloatChatOpen, setPlayerFloatChatOpen] = useState(false);
  const [playerFloatParticipantsOpen, setPlayerFloatParticipantsOpen] =
    useState(false);
  const [floatChatLastSeenId, setFloatChatLastSeenId] = useState(0);
  const [layoutPulse, setLayoutPulse] = useState(0);
  const [dialogPortal, setDialogPortal] = useState<HTMLElement | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    readStoredViewMode(roomSlug),
  );
  const [syncMode, setSyncModeState] = useState<SyncMode>("synced");
  const [driftSec, setDriftSec] = useState(0);
  const [alignedStableTicks, setAlignedStableTicks] = useState(0);
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
  /** Espectador: alinhar com âncora do host (entrada na sala ou Sincronizar). */
  const pendingViewerAlignRef = useRef(false);
  const viewerAlignRetryTimerRef = useRef(0);
  const viewerAlignRetriesLeftRef = useRef(0);
  /** Última leitura do tempo/estado do player, usada para detectar saltos (seeks). */
  const lastPlayerTickRef = useRef<{
    at: number;
    pos: number;
    playing: boolean;
  } | null>(null);
  /** Último video_id aplicado — usado para resetar syncMode quando o host troca de vídeo. */
  const lastAppliedVideoIdRef = useRef<string>("");

  /** `sync_epoch_ms` anterior (para saber quando o host publicou nova linha do tempo). */
  const prevSyncEpochForJumpGraceRef = useRef(roomAmbience.sync_epoch_ms);
  const hostPlaybackEpochChangedAtMsRef = useRef(0);
  const prevEnteredTransmissionRef = useRef(false);
  /** Evita aplicar alinhamento pendente em rajada (PLAYING/BUFFERING + sync_epoch). */
  const lastPendingAlignApplyAtMsRef = useRef(0);
  /** Evita dois `request_playback_anchor` automáticos em sequência (onReady + reentrada). */
  const lastAutoAnchorRequestAtMsRef = useRef(0);
  /** Após “Sincronizar”: não aplicar com estado antigo do servidor até chegar o seek da âncora. */
  const manualSyncAwaitingAnchorRef = useRef(false);
  const lastManualSyncClickMsRef = useRef(0);

  /** Debounce recuperação após onError do iframe (evita loop). */
  const lastPlayerErrorRecoverAtMsRef = useRef(0);
  /** Host: último estado do iframe (heartbeat live + fim de BUFFERING). */
  const prevHostPlayerStateRef = useRef(-1);
  const lastHostLiveHeartbeatAtMsRef = useRef(0);
  const lastHostAnchorBroadcastAtMsRef = useRef(0);
  /**
   * Viewer: timestamp do último `applyGoLiveOnPlayer` executado.
   * Usado para evitar seeks redundantes enquanto o player ainda está em BUFFERING
   * por causa de um go_live anterior (múltiplos cliques em "Sincronizar").
   */
  const lastGoLiveAppliedAtMsRef = useRef(0);

  const syncModeRef = useRef<SyncMode>(syncMode);
  const setSyncMode = useCallback((m: SyncMode) => {
    syncModeRef.current = m;
    setSyncModeState(m);
  }, []);

  const { can, snapshot, muteNotice } = useRoomPermissions();
  const selfId = user?.user_id != null ? Number(user.user_id) : null;
  const isOwner = snapshot?.is_owner ?? false;

  const amHost =
    selfId != null &&
    roomAmbience.active &&
    roomAmbience.host_user_id === selfId;

  const canCreateWatchparty = can("watchparty.create");
  const canChangeWatchpartyVideo =
    amHost || isOwner || can("watchparty.video.change");
  const canCloseWatchparty = amHost || isOwner || can("watchparty.close");
  const canPinWatchpartyMessages = amHost || isOwner || can("messages.pin");
  const canDeleteWatchpartyMessages =
    amHost || isOwner || can("messages.delete");
  const canKickWatchpartyMembers = can("members.kick");
  const canMuteWatchpartyMembers = can("members.mute");

  const canModerateWatchpartyTarget = useCallback(
    (targetUserId: number) => {
      if (selfId == null || targetUserId === selfId) return false;
      if (targetUserId === roomOwnerId) return false;
      if (targetUserId === roomAmbience.host_user_id) return false;
      return canModerateMember(snapshot, roomOwnerId, selfId, targetUserId);
    },
    [selfId, roomOwnerId, roomAmbience.host_user_id, snapshot],
  );

  const ambienceMessageModerationProps = useCallback(
    (m: RoomAmbienceMessage) => {
      if (ambienceMessageIsSystem(m)) return {};
      const authorId =
        typeof m.author_user_id === "number" && m.author_user_id > 0
          ? m.author_user_id
          : null;
      if (authorId == null) return {};
      const canActOnAuthor = canModerateWatchpartyTarget(authorId);
      const canDelete =
        canDeleteWatchpartyMessages &&
        (authorId === selfId || canActOnAuthor || isOwner || amHost);
      const canKick = canKickWatchpartyMembers && canActOnAuthor;
      const canMute = canMuteWatchpartyMembers && canActOnAuthor;
      if (!canDelete && !canKick && !canMute) return {};
      return {
        roomSlug,
        canDeleteMessage: canDelete,
        canKickAuthor: canKick,
        canMuteAuthor: canMute,
        onDeleteMessage: () => deleteAmbienceMessage(roomSlug, m.id),
      };
    },
    [
      amHost,
      canDeleteWatchpartyMessages,
      canKickWatchpartyMembers,
      canMuteWatchpartyMembers,
      canModerateWatchpartyTarget,
      isOwner,
      roomSlug,
      selfId,
    ],
  );

  const pinnedMessage = useMemo(() => {
    const pinId = roomAmbience.pinned_message_id;
    if (!pinId) return null;
    return roomAmbienceMessages.find((m) => m.id === pinId) ?? null;
  }, [roomAmbience.pinned_message_id, roomAmbienceMessages]);

  const handleReply = useCallback((m: RoomAmbienceMessage) => {
    setReplyTo(m);
  }, []);

  const handlePin = useCallback(
    (m: RoomAmbienceMessage) => {
      sendRoomAmbience({ action: "pin_message", message_id: m.id });
    },
    [sendRoomAmbience],
  );

  const handleUnpin = useCallback(() => {
    sendRoomAmbience({ action: "pin_message", message_id: null });
  }, [sendRoomAmbience]);

  const viewerAlignedMaxDriftSec = useMemo(() => {
    const p = playerRef.current;
    if (p && isLivePlayer(p)) return DRIFT_MAX_ALIGNED_SEC_LIVE;
    return DRIFT_MAX_ALIGNED_SEC_VOD;
  }, [driftSec, roomAmbience.video_id, entered]);

  const viewerAlignedStablePollsRequired = useMemo(() => {
    const p = playerRef.current;
    if (p && isLivePlayer(p)) return LIVE_ALIGNED_STABLE_POLLS;
    return VOD_ALIGNED_STABLE_POLLS;
  }, [driftSec, roomAmbience.video_id, entered]);

  /**
   * UI binária: “Ao vivo com host” só após drift estável por vários ticks (evita falso
   * positivo logo após seek/buffer). Independente de `syncMode`.
    roomAmbience.host_user_id === user.user_id;

  const viewerAlignedMaxDriftSec = DRIFT_MAX_ALIGNED_SEC;

  /**
   * UI binária: “Ao vivo com host” só com drift &lt; 1s e seguindo o host; caso contrário
   * “Modo independente” (inclui buffer pós-entrada até alinhar).
   */
  const viewerLiveWithHost =
    !amHost &&
    alignedStableTicks >= viewerAlignedStablePollsRequired &&
    Math.abs(driftSec) < viewerAlignedMaxDriftSec;

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

  const requestPlaybackAnchorAuto = useCallback(() => {
    const now = Date.now();
    if (now - lastAutoAnchorRequestAtMsRef.current < 500) return;
    lastAutoAnchorRequestAtMsRef.current = now;
    sendRoomAmbienceRef.current({ action: "request_playback_anchor" });
  }, []);

  /** Marca um período curto em que ignoramos mudanças de estado do player como ações do usuário. */
  const markApplyingRemote = useCallback(
    (durationMs = REMOTE_APPLY_GUARD_MS) => {
      applyingRemoteUntilRef.current = Date.now() + durationMs;
    },
    [],
  );

  /**
   * Host: pedidos de âncora só LEEM o iframe e publicam estado — nunca movem o player do host
   * (evita que “Sincronizar” de espectadores altere a transmissão).
   */
  useEffect(() => {
    const onAnchorRequest = () => {
      if (!amHostRef.current) return;
      const pl = playerRef.current;
      if (!pl?.getCurrentTime) return;
      const now = Date.now();
      if (now - lastHostAnchorBroadcastAtMsRef.current < 380) return;
      lastHostAnchorBroadcastAtMsRef.current = now;
      try {
        let t = pl.getCurrentTime() ?? 0;
        const live = isLivePlayer(pl);
        if (live) {
          const mx = liveMaxSeekSeconds(pl);
          if (mx != null) {
            t = Math.min(Math.max(0, t), mx);
          } else {
            t = Math.max(0, t);
          }
        } else {
          t = Math.max(0, t);
        }
        markApplyingRemote(REMOTE_APPLY_GUARD_MS);
        lastPlayerTickRef.current = {
          at: now,
          pos: t,
          playing: roomAmbienceRef.current.playing,
        };
        if (live && hostNearLiveEdge(pl, t)) {
          sendRoomAmbienceRef.current({
            action: "go_live",
            position_sec: t,
          });
        } else {
          sendRoomAmbienceRef.current({ action: "seek", position_sec: t });
        }
      } catch {
        /* ignore */
      }
    };
    window.addEventListener(
      "playgether:ambience-anchor-request",
      onAnchorRequest,
    );
    return () =>
      window.removeEventListener(
        "playgether:ambience-anchor-request",
        onAnchorRequest,
      );
  }, [markApplyingRemote]);

  const channelLabel = roomAmbience.channel_name?.trim() || "Canal do YouTube";
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
    let cancelled = false;
    const joinTimer = window.setTimeout(() => {
      if (!cancelled) sendRoomAmbienceRef.current({ action: "viewer_join" });
    }, 80);
    return () => {
      cancelled = true;
      window.clearTimeout(joinTimer);
      window.setTimeout(() => {
        sendRoomAmbienceRef.current({ action: "viewer_leave" });
      }, 350);
    };
  }, [roomAmbience.active, entered]);

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

  const openParticipantsPanel = useCallback(() => {
    const playerEl = playerStageRef.current;
    if (playerEl && document.fullscreenElement === playerEl) {
      setPlayerFloatParticipantsOpen(true);
    } else {
      setParticipantsOpen(true);
    }
  }, []);

  const openChatPanel = useCallback(() => {
    const playerEl = playerStageRef.current;
    if (playerEl && document.fullscreenElement === playerEl) {
      setPlayerFloatChatOpen(true);
    } else {
      setChatOpen(true);
    }
  }, []);

  const chatPanelHighlighted =
    (playerIsFs && playerFloatChatOpen) || (!playerIsFs && chatOpen);

  const participantsPanelHighlighted =
    (playerIsFs && playerFloatParticipantsOpen) ||
    (!playerIsFs && participantsOpen);

  const floatChatUnreadCount = useMemo(() => {
    if (!playerIsFs || playerFloatChatOpen) return 0;
    return roomAmbienceMessages.filter((m) => m.id > floatChatLastSeenId)
      .length;
  }, [
    playerIsFs,
    playerFloatChatOpen,
    roomAmbienceMessages,
    floatChatLastSeenId,
  ]);

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
  }, [
    chatOpen,
    playerFloatChatOpen,
    participantsOpen,
    playerFloatParticipantsOpen,
    settingsOpen,
  ]);

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
          else if (fsEl === playerStageRef.current)
            lastFsKindRef.current = "player";
        }
        return;
      }

      const el = fsEl;
      if (el) {
        if (el === shellRef.current) lastFsKindRef.current = "shell";
        else if (el === playerStageRef.current)
          lastFsKindRef.current = "player";
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
      if (amHostRef.current) return; // host is the source of truth, never apply to own player
      const p = playerRef.current;
      const ra = roomAmbienceRef.current;
      if (!p || !ra.active || !ra.video_id) return;

      const live = isLivePlayer(p);
      const desiredPlaying = ra.playing;

      if (!amHostRef.current && ra.playback_command === "go_live") {
        markApplyingRemote(opts?.guardMs ?? VIEWER_ALIGN_GUARD_MS);
        // Clear pending alignment so subsequent heartbeats don't trigger
        // repeated go-live seeks while the player is still buffering.
        pendingViewerAlignRef.current = false;
        viewerAlignRetriesLeftRef.current = 0;
        if (viewerAlignRetryTimerRef.current) {
          window.clearTimeout(viewerAlignRetryTimerRef.current);
          viewerAlignRetryTimerRef.current = 0;
        }
        try {
          const currentState = p.getPlayerState?.() ?? -1;
          const playerIsBuffering = currentState === YT_BUFFERING;
          const timeSinceLastGoLive =
            Date.now() - lastGoLiveAppliedAtMsRef.current;
          // Se o player ainda está em BUFFERING por causa de um seek go_live
          // recente, não interrompemos com outro seek — deixamos o buffer completar.
          // Isso evita que múltiplos cliques em "Sincronizar" reiniciem
          // repetidamente o buffering e deixem o player cada vez mais atrás do live.
          if (
            playerIsBuffering &&
            timeSinceLastGoLive < VIEWER_ALIGN_GUARD_MS
          ) {
            // Seek já em andamento — ignorar esta repetição
          } else {
            applyGoLiveOnPlayer(p, desiredPlaying);
            lastGoLiveAppliedAtMsRef.current = Date.now();
            const cap = liveStreamTimelineCap(p);
            const pos =
              Number.isFinite(cap) && cap < Number.MAX_SAFE_INTEGER / 4
                ? cap
                : (p.getCurrentTime?.() ?? 0);
            lastPlayerTickRef.current = {
              at: Date.now(),
              pos,
              playing: desiredPlaying,
            };
          }
        } catch {
          /* ignore */
        }
        return;
      }

      let targetPos = live
        ? liveViewerTargetSeconds(
            p,
            desiredPlaying,
            ra.position_sec,
            ra.sync_epoch_ms,
          )
        : computeSyncedSeconds(
            desiredPlaying,
            ra.position_sec,
            ra.sync_epoch_ms,
          );

      try {
        const currentTime = p.getCurrentTime?.() ?? 0;
        const currentState = p.getPlayerState?.() ?? -1;
        if (
          live &&
          Number.isFinite(targetPos) &&
          desiredPlaying &&
          ra.position_sec < 8
        ) {
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
        const diff = targetFinite
          ? Math.abs(currentTime - targetPos)
          : Number.POSITIVE_INFINITY;
        const seekThreshold = opts?.forceSeek ? 0.12 : APPLY_SEEK_THRESHOLD_SEC;
        const needSeek = diff > seekThreshold;
        // Always defer a seek while buffering (unless forceSeek) to avoid
        // the second redundant seek that fires right after a go_live seek.
        const deferSeek =
          needSeek && !opts?.forceSeek && currentState === YT_BUFFERING;
        const needPlay =
          desiredPlaying &&
          !isCurrentlyPlaying &&
          currentState !== YT_BUFFERING;
        const needPause = !desiredPlaying && isCurrentlyPlaying;

        if ((!needSeek || deferSeek) && !needPlay && !needPause) return;

        markApplyingRemote(opts?.guardMs);
        const didSeek = needSeek && !deferSeek;
        if (didSeek) {
          let seekArg: number = targetFinite
            ? targetPos
            : Number.MAX_SAFE_INTEGER;
          if (targetFinite && live && desiredPlaying) {
            try {
              const cap = liveStreamTimelineCap(p);
              if (
                Number.isFinite(cap) &&
                cap < Number.MAX_SAFE_INTEGER / 4 &&
                targetPos >= cap - LIVE_GO_SEEK_MAX_BELOW_CAP_SEC
              ) {
                applyGoLiveOnPlayer(p, desiredPlaying);
                lastPlayerTickRef.current = {
                  at: Date.now(),
                  pos: cap,
                  playing: desiredPlaying,
                };
                return;
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

  const clearViewerAlignRetries = useCallback(() => {
    viewerAlignRetriesLeftRef.current = 0;
    if (viewerAlignRetryTimerRef.current) {
      window.clearTimeout(viewerAlignRetryTimerRef.current);
      viewerAlignRetryTimerRef.current = 0;
    }
  }, []);

  /** Viewer saiu do seguimento automático (controlo local ou drift ≥ 1s). */
  const markViewerIndependent = useCallback(() => {
    pendingViewerAlignRef.current = false;
    manualSyncAwaitingAnchorRef.current = false;
    clearViewerAlignRetries();
    setAlignedStableTicks(0);
    setSyncMode("independent");
  }, [clearViewerAlignRetries, setSyncMode]);

  const scheduleViewerAlignRetry = useCallback(() => {
    if (viewerAlignRetriesLeftRef.current <= 0) {
      pendingViewerAlignRef.current = false;
      return;
    }
    if (viewerAlignRetryTimerRef.current) {
      window.clearTimeout(viewerAlignRetryTimerRef.current);
    }
    viewerAlignRetryTimerRef.current = window.setTimeout(() => {
      viewerAlignRetryTimerRef.current = 0;
      if (
        !pendingViewerAlignRef.current ||
        amHostRef.current ||
        syncModeRef.current !== "synced"
      ) {
        return;
      }
      viewerAlignRetriesLeftRef.current -= 1;
      if (viewerAlignRetriesLeftRef.current <= 0) {
        pendingViewerAlignRef.current = false;
        return;
      }
      markApplyingRemote(VIEWER_ALIGN_GUARD_MS);
      lastPendingAlignApplyAtMsRef.current = Date.now();
      applyPlaybackFromStateRef.current?.({
        forceSeek: true,
        deferSeekWhileBuffering: true,
        guardMs: VIEWER_ALIGN_GUARD_MS,
      });
      const p = playerRef.current;
      let stillBuffering = false;
      try {
        stillBuffering = (p?.getPlayerState?.() ?? -1) === YT_BUFFERING;
      } catch {
        /* ignore */
      }
      if (stillBuffering && pendingViewerAlignRef.current) {
        scheduleViewerAlignRetry();
      }
    }, VIEWER_ALIGN_RETRY_MS);
  }, [markApplyingRemote]);

  /** Entrada na sala / Sincronizar: pede âncora e reaplica até o iframe estabilizar. */
  const alignViewerToHostPlayback = useCallback(() => {
    if (amHostRef.current) return;
    pendingViewerAlignRef.current = true;
    manualSyncAwaitingAnchorRef.current = false;
    viewerAlignRetriesLeftRef.current = VIEWER_ALIGN_MAX_RETRIES;
    markApplyingRemote(VIEWER_ALIGN_GUARD_MS);
    lastPendingAlignApplyAtMsRef.current = Date.now();
    applyPlaybackFromStateRef.current?.({
      forceSeek: true,
      deferSeekWhileBuffering: true,
      guardMs: VIEWER_ALIGN_GUARD_MS,
    });
    const p = playerRef.current;
    try {
      if ((p?.getPlayerState?.() ?? -1) === YT_BUFFERING) {
        scheduleViewerAlignRetry();
      }
    } catch {
      /* ignore */
    }
  }, [markApplyingRemote, scheduleViewerAlignRetry]);

  /** Saiu da transmissão: limpa alinhamento pendente (reentrada pede âncora de novo). */
  useEffect(() => {
    if (entered) return;
    prevEnteredTransmissionRef.current = false;
    pendingViewerAlignRef.current = false;
    manualSyncAwaitingAnchorRef.current = false;
    clearViewerAlignRetries();
    setDriftSec(0);
    setAlignedStableTicks(0);
  }, [entered, clearViewerAlignRetries]);

  /**
   * Reentrou na transmissão (Sair → voltar): mesmo fluxo da primeira entrada — âncora ao host.
   */
  useEffect(() => {
    if (!entered || amHost || !roomAmbience.active || !roomAmbience.video_id)
      return;
    const justEntered = !prevEnteredTransmissionRef.current;
    prevEnteredTransmissionRef.current = true;
    if (!justEntered) return;

    setSyncMode("synced");
    requestPlaybackAnchorAuto();
  }, [
    entered,
    amHost,
    roomAmbience.active,
    roomAmbience.video_id,
    setSyncMode,
    requestPlaybackAnchorAuto,
  ]);

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
      floatChatEndRef.current?.scrollIntoView({
        behavior: "auto",
        block: "end",
      });
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
        YT?: {
          Player: new (el: HTMLElement | string, opts: unknown) => YtPlayer;
        };
      };
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
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
          onError: (e: { data: number }) => {
            /** 2 = parâmetro inválido, 5 = erro HTML5 — às vezes após seeks agressivos; 100/101/150 = vídeo indisponível ou embed bloqueado. */
            const code = e.data;
            if (code !== 2 && code !== 5) return;
            // Never reload the host's video on error — YouTube will self-recover and
            // loadVideoById would restart the stream from position 0.
            if (amHostRef.current) return;
            const p = playerRef.current;
            if (!p?.loadVideoById) return;
            const vid = roomAmbienceRef.current?.video_id;
            if (!vid || !roomAmbienceRef.current.active) return;
            const now = Date.now();
            if (now - lastPlayerErrorRecoverAtMsRef.current < 10_000) return;
            lastPlayerErrorRecoverAtMsRef.current = now;
            try {
              markApplyingRemote(VIEWER_ALIGN_GUARD_MS);
              p.loadVideoById(vid);
            } catch {
              /* ignore */
            }
          },
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
              setSyncMode("synced");
              requestPlaybackAnchorAuto();
              alignViewerToHostPlayback();
            }
            /**
             * Espectador: pede âncora ao host e alinha (com retentativas em BUFFERING).
             * Novos seeks do host chegam com novo `sync_epoch_ms` e disparam o useEffect.
             * Garante que o iframe possa receber foco do teclado.
             */
            try {
              const iframe =
                p.getIframe?.() ?? mountRef.current?.querySelector("iframe");
              if (iframe instanceof HTMLIFrameElement) {
                if (!iframe.hasAttribute("tabindex"))
                  iframe.setAttribute("tabindex", "0");
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
              const prevTick = lastPlayerTickRef.current;
              /**
               * Mantemos o tick atualizado sempre — assim o polling não enxerga
               * "salto" quando o iframe re-emite PLAYING depois de um buffering pós-seek.
               */
              lastPlayerTickRef.current = {
                at: Date.now(),
                pos: cur,
                playing: isPlaying,
              };

              /**
               * Detecção imediata de seek nativo (setas/barra do YouTube):
               * Se o player voltou a PLAYING e a posição saltou mais do que o
               * threshold, broadcastamos seek agora sem esperar o polling (520ms).
               * Só dispara fora da janela de guarda para não duplicar com polls.
               */
              if (
                isPlaying &&
                prevTick &&
                prevTick.playing &&
                Date.now() >= applyingRemoteUntilRef.current
              ) {
                const elapsed = (Date.now() - prevTick.at) / 1000;
                const expected = prevTick.pos + elapsed;
                const jump = Math.abs(cur - expected);
                if (jump > SEEK_JUMP_THRESHOLD_SEC) {
                  lastBroadcastPlayingRef.current = true;
                  sendRoomAmbienceRef.current({
                    action: "seek",
                    position_sec: cur,
                  });
                  return;
                }
              }

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

            if (pendingViewerAlignRef.current && state === 1) {
              if (manualSyncAwaitingAnchorRef.current) return;
              try {
                const driftHere = computeViewerHostDriftSec(
                  p,
                  roomAmbienceRef.current,
                  cur,
                );
                const maxDrift = isLivePlayer(p)
                  ? DRIFT_MAX_ALIGNED_SEC_LIVE
                  : DRIFT_MAX_ALIGNED_SEC_VOD;
                if (Math.abs(driftHere) >= maxDrift) {
                  markViewerIndependent();
                  return;
                }
              } catch {
                /* ignore */
              }
              const now = Date.now();
              if (now - lastPendingAlignApplyAtMsRef.current < 520) return;
              lastPendingAlignApplyAtMsRef.current = now;
              markApplyingRemote(VIEWER_ALIGN_GUARD_MS);
              applyPlaybackFromStateRef.current?.({
                forceSeek: true,
                deferSeekWhileBuffering: true,
                guardMs: VIEWER_ALIGN_GUARD_MS,
              });
              try {
                const pp = playerRef.current;
                if ((pp?.getPlayerState?.() ?? -1) === YT_BUFFERING) {
                  viewerAlignRetriesLeftRef.current = VIEWER_ALIGN_MAX_RETRIES;
                  scheduleViewerAlignRetry();
                }
              } catch {
                /* ignore */
              }
              return;
            }

            // Viewer: ignora dentro da janela de guarda (estamos aplicando estado do host)…
            if (Date.now() < applyingRemoteUntilRef.current) return;
            /**
             * …ou se play/pause já casa com o host e a timeline está a &lt; 1s. Com drift maior,
             * não retornamos cedo — evita “Ao vivo com host” falso e deixa o polling marcar
             * independente ao interagir com a barra do YouTube.
             */
            const hostState = roomAmbienceRef.current;
            const playPauseMatchesHost =
              (state === 1 && hostState.playing) ||
              (state === 2 && !hostState.playing);
            if (playPauseMatchesHost) {
              try {
                const driftHere = computeViewerHostDriftSec(p, hostState, cur);
                const maxDrift = isLivePlayer(p)
                  ? DRIFT_MAX_ALIGNED_SEC_LIVE
                  : DRIFT_MAX_ALIGNED_SEC_VOD;
                if (Math.abs(driftHere) < maxDrift) return;
              } catch {
                return;
              }
            }
            if (syncModeRef.current === "synced") markViewerIndependent();
          },
        },
      });
    });
    return () => {
      cancelled = true;
      pendingViewerAlignRef.current = false;
      manualSyncAwaitingAnchorRef.current = false;
      clearViewerAlignRetries();
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
      if (mountRef.current) mountRef.current.innerHTML = "";
      lastPlayerTickRef.current = null;
      prevHostPlayerStateRef.current = -1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Player só deve recriar quando vídeo ou estado da sala muda; handlers estáveis via ref.
  }, [
    entered,
    roomAmbience.active,
    roomAmbience.video_id,
    alignViewerToHostPlayback,
    clearViewerAlignRetries,
    setSyncMode,
    requestPlaybackAnchorAuto,
    scheduleViewerAlignRetry,
    markViewerIndependent,
  ]);

  /**
   * O host é a fonte da verdade — nunca aplicamos estado vindo do servidor no
   * próprio player do host (evita reverter ações dele com a latência do broadcast).
   * Viewers em modo "synced" aplicam seek/play/pause do host quando o servidor publica
   * novo `sync_epoch_ms`; em modo "independent" ignoram para o player ficar local.
   */
  useEffect(() => {
    if (amHost) return;
    // go_live bypasses independent mode: host pressed "Ao vivo" and everyone must follow.
    // We trust the server — no need to check isLivePlayer locally (it may return false on
    // viewer's player while the stream IS live, silently dropping the command).
    const isGoLive = roomAmbience.playback_command === "go_live";
    if (syncMode !== "synced" && !isGoLive) return;
    if (isGoLive && syncMode !== "synced") {
      setSyncMode("synced");
      setAlignedStableTicks(0);
    }
    if (pendingViewerAlignRef.current) {
      try {
        markApplyingRemote(VIEWER_ALIGN_GUARD_MS);
        lastPendingAlignApplyAtMsRef.current = Date.now();
        applyPlaybackFromStateRef.current?.({
          forceSeek: true,
          deferSeekWhileBuffering: true,
          guardMs: VIEWER_ALIGN_GUARD_MS,
        });
        try {
          const p = playerRef.current;
          if ((p?.getPlayerState?.() ?? -1) === YT_BUFFERING) {
            viewerAlignRetriesLeftRef.current = VIEWER_ALIGN_MAX_RETRIES;
            scheduleViewerAlignRetry();
          }
        } catch {
          /* ignore */
        }
      } finally {
        manualSyncAwaitingAnchorRef.current = false;
      }
    } else {
      applyPlaybackFromState();
    }
  }, [
    amHost,
    syncMode,
    applyPlaybackFromState,
    scheduleViewerAlignRetry,
    markApplyingRemote,
    roomAmbience.active,
    roomAmbience.video_id,
    roomAmbience.sync_epoch_ms,
    roomAmbience.playback_command,
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
    requestPlaybackAnchorAuto();
  }, [roomAmbience.video_id, setSyncMode, requestPlaybackAnchorAuto]);

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
   * 2) Drift para o badge (≥ 1s = fora de sincronia / modo independente).
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

      const p = playerRef.current;
      // Em live, poll mais rápido para detectar o "Ir ao vivo" do host com menos atraso.
      const nextDelayBase = p && isLivePlayer(p) ? 280 : 520;

      if (!p?.getCurrentTime || !p.getPlayerState) {
        scheduleNext(520);
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

          if (jumpedToLiveEdge) {
            let pos = Math.max(0, actual);
            const mx2 = liveMaxSeekSeconds(p);
            if (mx2 != null) pos = Math.min(pos, mx2);
            markApplyingRemote(REMOTE_APPLY_GUARD_MS);
            lastPlayerTickRef.current = {
              at: now,
              pos,
              playing: roomAmbienceRef.current.playing,
            };
            sendRoomAmbienceRef.current({
              action: "go_live",
              position_sec: pos,
            });
          } else if (Math.abs(jump) > SEEK_JUMP_THRESHOLD_SEC) {
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

          const liveHost = isLivePlayer(p);
          const raHost = roomAmbienceRef.current;
          if (
            liveHost &&
            raHost.active &&
            raHost.playing &&
            playerState === 1
          ) {
            const extrapolated = computeSyncedSeconds(
              raHost.playing,
              raHost.position_sec,
              raHost.sync_epoch_ms,
            );
            let broadcastPos = Math.max(0, actual);
            const mxHb = liveMaxSeekSeconds(p);
            if (mxHb != null) broadcastPos = Math.min(broadcastPos, mxHb);
            const iframeDrift = Math.abs(broadcastPos - extrapolated);
            const leftBuffering =
              prevHostPlayerStateRef.current === YT_BUFFERING;
            const heartbeatDue =
              now - lastHostLiveHeartbeatAtMsRef.current >=
              HOST_LIVE_HEARTBEAT_MIN_INTERVAL_MS;
            if (
              leftBuffering ||
              (heartbeatDue && iframeDrift >= HOST_LIVE_HEARTBEAT_DRIFT_SEC)
            ) {
              lastHostLiveHeartbeatAtMsRef.current = now;
              markApplyingRemote(REMOTE_APPLY_GUARD_MS);
              lastPlayerTickRef.current = {
                at: now,
                pos: broadcastPos,
                playing: true,
              };
              // Heartbeat always broadcasts seek (not go_live) to keep the
              // server position accurate without forcing independent viewers
              // back to the live edge against their will. go_live is reserved
              // for the explicit "jump to live edge" detection below.
              sendRoomAmbienceRef.current({
                action: "seek",
                position_sec: broadcastPos,
              });
            }
          }
          prevHostPlayerStateRef.current = playerState;
        } else if (!inGuard) {
          const liveForJump = isLivePlayer(p);
          const jumpTh = liveForJump
            ? LIVE_VIEWER_JUMP_THRESHOLD_SEC
            : SEEK_JUMP_THRESHOLD_SEC;
          const sinceEpoch =
            Date.now() - hostPlaybackEpochChangedAtMsRef.current;
          const inHostApplyGrace =
            hostPlaybackEpochChangedAtMsRef.current > 0 &&
            sinceEpoch < VIEWER_JUMP_IGNORE_INDEP_MS_AFTER_SYNC_EPOCH;
          const absJump = Math.abs(jump);

          if (
            syncModeRef.current === "synced" &&
            absJump > VIEWER_USER_CONTROL_JUMP_SEC
          ) {
            if (inHostApplyGrace && absJump > jumpTh) {
              /* salto grande do host em live (DVR) — não marcar independente */
            } else {
              markViewerIndependent();
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
      const liveViewer = isLivePlayer(p);
      // On live streams, if the server has not yet published a real anchor
      // (position_sec still near 0 but DVR window is large), the drift
      // formula gives a meaningless huge value like "7667 s". Show 0 instead.
      const liveStale =
        liveViewer &&
        hs.position_sec < 8 &&
        (() => {
          try {
            const d = p.getDuration?.() ?? 0;
            return d > 120;
          } catch {
            return false;
          }
        })();
      const newDrift = liveStale ? 0 : computeViewerHostDriftSec(p, hs, actual);
      const absDrift = Math.abs(newDrift);
      const alignedBand = liveViewer
        ? DRIFT_MAX_ALIGNED_SEC_LIVE
        : DRIFT_MAX_ALIGNED_SEC_VOD;
      const stableRequired = liveViewer
        ? LIVE_ALIGNED_STABLE_POLLS
        : VOD_ALIGNED_STABLE_POLLS;

      setAlignedStableTicks((prev) => {
        // Reset while seek is still in flight; inGuard alone is too conservative (6 s)
        if (pendingViewerAlignRef.current) return 0;
        if (absDrift < alignedBand) {
          return Math.min(prev + 1, stableRequired);
        }
        return 0;
      });

      setDriftSec((prev) => {
        const prevAligned = Math.abs(prev) < alignedBand;
        const nextAligned = absDrift < alignedBand;
        // Flip between aligned/unaligned immediately
        if (prevAligned !== nextAligned) return newDrift;
        // When aligned: suppress micro-jitter
        if (nextAligned) {
          if (Math.abs(prev - newDrift) < DRIFT_UPDATE_THRESHOLD_SEC)
            return prev;
          return newDrift;
        }
        const delta = Math.abs(newDrift - prev);
        // Big jump (e.g. seek, or stale-state resolving): update immediately
        if (delta > 8 || playerState === YT_BUFFERING) return newDrift;
        if (delta < 0.06) return prev;
        // Both playing: the drift is physically constant (both streams advance
        // at 1 s/s). Freeze the display with a very slow EMA correction only.
        if (hs.playing && playing) {
          return prev + (newDrift - prev) * 0.04;
        }
        // One side is paused: drift changes at ~1 s/s — update promptly
        return newDrift;
      });

      if (
        !inGuard &&
        !pendingViewerAlignRef.current &&
        syncModeRef.current === "synced" &&
        absDrift >= alignedBand
      ) {
        markViewerIndependent();
      }

      if (
        pendingViewerAlignRef.current &&
        syncModeRef.current === "synced" &&
        absDrift < alignedBand
      ) {
        pendingViewerAlignRef.current = false;
        clearViewerAlignRetries();
      }

      scheduleNext(nextDelayBase);
    };

    scheduleNext(160);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    entered,
    roomAmbience.active,
    roomAmbience.video_id,
    markApplyingRemote,
    clearViewerAlignRetries,
    markViewerIndependent,
  ]);

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
      else if (e.key === " " || e.key === "k" || e.key === "K")
        togglePlay = true;
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
            sendRoomAmbienceRef.current({
              action: "seek",
              position_sec: newPos,
            });
          } else {
            markViewerIndependent();
            p.seekTo(newPos, true);
            lastPlayerTickRef.current = {
              at: Date.now(),
              pos: newPos,
              playing: lastPlayerTickRef.current?.playing ?? false,
            };
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
            markViewerIndependent();
            if (wantPlay) p.playVideo();
            else p.pauseVideo();
            lastPlayerTickRef.current = {
              at: Date.now(),
              pos: cur,
              playing: wantPlay,
            };
          }
        }
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [
    entered,
    roomAmbience.active,
    roomAmbience.video_id,
    markApplyingRemote,
    markViewerIndependent,
  ]);

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
      onEnteredChange(true);
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
    if (muteNotice) return;
    const body = chatText.trim();
    if (!body) return;
    sendRoomAmbience({
      action: "send_message",
      body,
      ...(replyTo ? { reply_to_id: replyTo.id } : {}),
    });
    setChatText("");
    setReplyTo(null);
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
    if (kind === "play")
      sendRoomAmbience({ action: "play", position_sec: cur });
    else if (kind === "pause")
      sendRoomAmbience({ action: "pause", position_sec: cur });
    else if (kind === "seek")
      sendRoomAmbience({ action: "seek", position_sec: newPos });
  };

  /** Sincronizar: só um seek quando o host publicar a âncora (evita seek com estado antigo + seek novo). */
  const handleManualSync = useCallback(() => {
    if (amHostRef.current) return;
    const now = Date.now();
    if (now - lastManualSyncClickMsRef.current < 700) return;
    lastManualSyncClickMsRef.current = now;

    clearViewerAlignRetries();
    setAlignedStableTicks(0);
    setSyncMode("synced");
    pendingViewerAlignRef.current = true;
    manualSyncAwaitingAnchorRef.current = true;
    viewerAlignRetriesLeftRef.current = VIEWER_ALIGN_MAX_RETRIES;
    sendRoomAmbienceRef.current({ action: "request_playback_anchor" });
    window.setTimeout(() => {
      if (manualSyncAwaitingAnchorRef.current) {
        manualSyncAwaitingAnchorRef.current = false;
      }
    }, 10_000);
  }, [setSyncMode, clearViewerAlignRetries]);

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
      setLocalVolume(
        preMuteVolumeRef.current > 0 ? preMuteVolumeRef.current : 80,
      );
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
    if (
      viewMode === "cinema" &&
      document.fullscreenElement === shellRef.current
    )
      return;
    if (viewMode === "cinema" && !document.fullscreenElement) {
      void shellRef.current?.requestFullscreen().catch(() => {});
      return;
    }
    setLayoutMode("cinema");
  };

  const enterFullPlayerLayout = () => {
    if (
      viewMode === "fullplayer" &&
      document.fullscreenElement === playerStageRef.current
    )
      return;
    if (viewMode === "fullplayer" && !document.fullscreenElement) {
      void playerStageRef.current?.requestFullscreen().catch(() => {});
      return;
    }
    setLayoutMode("fullplayer");
  };

  if (!roomAmbience.active) {
    if (!canCreateWatchparty) {
      return (
        <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-gradient-to-b from-muted/15 to-background p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <TvMinimalPlay className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Watchparty</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Não há transmissões ao vivo no momento.
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-gradient-to-b from-muted/15 to-background">
        <div className="mx-auto w-full max-w-lg space-y-6 p-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <TvMinimalPlay className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Watchparty</h2>
            <p className="text-sm text-muted-foreground">
              Inicie uma transmissão do YouTube para a sala. Apenas quem iniciar
              controla a reprodução; espectadores ajustam apenas o volume local.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm">
            <div className="flex gap-2">
              <input
                value={createUrl}
                onChange={(e) => setCreateUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
              />
              <Button disabled={busy} onClick={() => void createTransmission()}>
                Iniciar
              </Button>
            </div>
            {roomAmbienceError ? (
              <p className="text-center text-xs text-destructive">
                {roomAmbienceError}
              </p>
            ) : null}
          </div>
        </div>
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
        <h2 className="max-w-2xl text-center text-xl font-bold">
          {roomAmbience.title || "Transmissão ao vivo"}
        </h2>
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
          {roomAmbience.host_username
            ? `Host da sala: ${roomAmbience.host_username}`
            : "Modo Ambiente"}
        </p>
        <p className="text-sm font-medium text-foreground">
          {watchingNowLabel(roomAmbience.viewers.length)}
        </p>
        {transmissionBanNotice ? (
          <p className="max-w-md rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive">
            {transmissionBanNotice}
          </p>
        ) : null}
        <Button
          size="lg"
          className="px-5"
          disabled={Boolean(transmissionBanNotice)}
          onClick={() => onEnteredChange(true)}
        >
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
            {canChangeWatchpartyVideo || canCloseWatchparty ? (
              <>
                {canChangeWatchpartyVideo ? (
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
                ) : null}
                {canCloseWatchparty ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8"
                    onClick={() => setConfirmCloseOpen(true)}
                  >
                    Encerrar
                  </Button>
                ) : null}
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
              <span className="font-semibold text-foreground">
                {roomAmbience.host_username}
              </span>
            </span>
          </Link>
        ) : null}
      </div>

      <div className={cn(mainRowClass, "relative")}>
        <div ref={playerStageRef} className={cn(playerStageClass, "order-2")}>
          <div className="relative min-h-0 flex-1 overflow-hidden [contain:layout_paint] [isolation:isolate]">
            <div ref={mountRef} className="absolute inset-0 h-full w-full" />
            <div
              className="pointer-events-none absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 shadow-md ring-1 ring-white/15"
              aria-hidden
            >
              <YoutubeMark className="h-4 w-5 shrink-0 text-[#FF0033]" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-white/90">
                YouTube
              </span>
            </div>
            {!participantsPanelHighlighted ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="pointer-events-auto absolute left-2 top-2 z-20 h-9 w-9 border-white/25 bg-black/70 text-white shadow-lg hover:bg-white/15 hover:text-white"
                title="Abrir participantes"
                onClick={openParticipantsPanel}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : null}
            {!chatPanelHighlighted ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="pointer-events-auto absolute right-2 top-2 z-20 h-9 w-9 border-white/25 bg-black/70 text-white shadow-lg hover:bg-white/15 hover:text-white"
                title="Abrir chat"
                onClick={openChatPanel}
              >
                <ChevronLeft className="h-4 w-4" />
                {playerIsFs ? (
                  <ChatFloatUnreadBadge count={floatChatUnreadCount} />
                ) : null}
              </Button>
            ) : null}
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
                          displayName={
                            participant.fullname || participant.username
                          }
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
                          <p className="truncate text-[11px] text-zinc-400">
                            @{participant.username}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-400">
                      Ninguém na transmissão agora.
                    </p>
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
                {pinnedMessage ? (
                  <AmbiencePinnedBanner
                    message={pinnedMessage}
                    float
                    onUnpin={canPinWatchpartyMessages ? handleUnpin : undefined}
                  />
                ) : null}
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden bg-black px-2 py-2">
                  {floatChatMessages.length === 0 ? (
                    <AmbienceChatEmptyState float />
                  ) : (
                    floatChatMessages.map((m) => (
                      <AmbienceChatLine
                        key={m.id}
                        m={m}
                        variant="float"
                        isPinned={roomAmbience.pinned_message_id === m.id}
                        onReply={handleReply}
                        onPin={canPinWatchpartyMessages ? handlePin : undefined}
                        onUnpin={handleUnpin}
                        {...ambienceMessageModerationProps(m)}
                      />
                    ))
                  )}
                  <div ref={floatChatEndRef} />
                </div>
                <AmbienceChatInput
                  float
                  value={chatText}
                  onChange={setChatText}
                  onSend={sendComment}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  muteNotice={muteNotice}
                />
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
                  {viewerLiveWithHost ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/60 bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-200"
                      title="Sua posição está alinhada com a do host (live: margem &lt; 0,7s da borda ao vivo)"
                    >
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                      Ao vivo com host
                    </span>
                  ) : (
                    <>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/35 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-100"
                        title="Fora de sincronia com o host ou controlo local — use Sincronizar"
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
                {!amHost ? (
                  <div className="relative">
                    <Button
                      ref={settingsTriggerRef}
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-8 w-8 border-white/25 bg-black/40 text-white hover:bg-white/15 hover:text-white",
                        settingsOpen &&
                          "border-primary/60 bg-primary/25 text-white",
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
                            Ao entrar ou usar{" "}
                            <strong className="text-foreground">
                              Sincronizar
                            </strong>
                            , pedimos ao host o tempo real do vídeo. O chip{" "}
                            <strong className="text-foreground">
                              Ao vivo com host
                            </strong>{" "}
                            só aparece após várias leituras estáveis com drift
                            mínimo (live: &lt; 0,7s da borda ao vivo); caso
                            contrário,{" "}
                            <strong className="text-foreground">
                              Modo independente
                            </strong>
                            .
                          </p>
                        </div>
                        <div className="px-3 py-2 text-[11px] text-muted-foreground">
                          {viewerLiveWithHost ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                              Timeline:{" "}
                              <strong className="text-foreground">
                                alinhada
                              </strong>{" "}
                              em relação ao host
                            </span>
                          ) : (
                            <span className="inline-flex flex-wrap items-center gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                              Modo independente
                              {Math.abs(driftSec) >= 0.55 ? (
                                <>
                                  {" "}
                                  —{" "}
                                  <strong className="text-foreground">
                                    {formatDriftOffsetOnly(driftSec)}
                                  </strong>
                                </>
                              ) : null}
                              <span className="text-muted-foreground">
                                {" "}
                                — use Sincronizar
                              </span>
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
                    layoutHighlight === "small" &&
                      "border-primary/60 bg-primary/25 text-white",
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
                    layoutHighlight === "cinema" &&
                      "border-primary/60 bg-primary/25 text-white",
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
                    layoutHighlight === "fullplayer" &&
                      "border-primary/60 bg-primary/25 text-white",
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
                  aria-label={
                    localVolume === 0 ? "Restaurar volume" : "Silenciar"
                  }
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
                roomAmbience.viewers.map((participant) => {
                  const canModViewer = canModerateWatchpartyTarget(
                    participant.user_id,
                  );
                  return (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-2 py-2"
                    >
                      <ProfileAvatar
                        displayName={
                          participant.fullname || participant.username
                        }
                        username={participant.username}
                        profilePhoto={participant.profile_photo}
                        sizeClass="h-8 w-8"
                        fallbackTextClassName="text-[10px]"
                        className="ring-1 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {participant.fullname || participant.username}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          @{participant.username}
                        </p>
                      </div>
                      {canModViewer ? (
                        <RoomMemberModerationMenu
                          roomSlug={roomSlug}
                          userId={participant.user_id}
                          memberName={
                            participant.fullname || participant.username
                          }
                          canKick={canKickWatchpartyMembers}
                          canMute={canMuteWatchpartyMembers}
                          kickScope="ambience"
                          triggerClassName="rounded-md p-1 text-muted-foreground hover:bg-background"
                        />
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-foreground">
                  Ninguém está assistindo a transmissão agora.
                </p>
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
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    Chat
                  </span>
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
                    <span className="font-semibold text-foreground">
                      {roomAmbience.host_username}
                    </span>
                  </span>
                </Link>
              ) : null}
            </div>
            {pinnedMessage ? (
              <AmbiencePinnedBanner
                message={pinnedMessage}
                onUnpin={canPinWatchpartyMessages ? handleUnpin : undefined}
              />
            ) : null}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
              {roomAmbienceMessages.length === 0 ? (
                <AmbienceChatEmptyState />
              ) : (
                roomAmbienceMessages.map((m) => (
                  <AmbienceChatLine
                    key={m.id}
                    m={m}
                    isPinned={roomAmbience.pinned_message_id === m.id}
                    onReply={handleReply}
                    onPin={canPinWatchpartyMessages ? handlePin : undefined}
                    onUnpin={handleUnpin}
                    {...ambienceMessageModerationProps(m)}
                  />
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <AmbienceChatInput
              value={chatText}
              onChange={setChatText}
              onSend={sendComment}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              muteNotice={muteNotice}
            />
          </div>
        ) : null}
      </div>
      {roomAmbienceError ? (
        <p className="text-sm text-destructive">{roomAmbienceError}</p>
      ) : null}
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
                <p>
                  O vídeo atual será substituído para todos que estão na
                  transmissão.
                </p>
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

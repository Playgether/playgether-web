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
};

/** Pequena = layout clássico; Cinema = painel em tela cheia do navegador; Tela cheia = só o player (estilo YouTube). */
type ViewMode = "small" | "cinema" | "fullplayer";

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

function computeSyncedSeconds(
  playing: boolean,
  positionSec: number,
  syncEpochMs: number,
): number {
  const elapsed = Math.max(0, (Date.now() - syncEpochMs) / 1000);
  return playing ? positionSec + elapsed : positionSec;
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
            ? "border-white/25 bg-white/10 text-white/90"
            : "border-border/60 bg-muted/50 text-muted-foreground",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-semibold uppercase tracking-wide",
            float ? "text-white/65" : "text-muted-foreground",
          )}
        >
          Sistema
        </p>
        <p className={cn("whitespace-pre-wrap", float ? "text-white/95" : "text-foreground")}>
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
        float ? "border-white/15 bg-black/40 text-white" : "border-border/40 bg-muted/20 text-foreground",
      )}
    >
      <ProfileAvatar
        displayName={m.author_username}
        username={m.author_username}
        profilePhoto={m.author_photo}
        sizeClass="h-8 w-8"
        fallbackTextClassName="text-[10px]"
        className={cn("mt-0.5 shrink-0 ring-1", float ? "ring-white/20" : "ring-border")}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-[11px] font-semibold", float ? "text-white/90" : "text-foreground")}>
          {m.author_username}
        </p>
        <p className={cn("text-sm", float ? "text-white/95" : "text-foreground")}>{m.body}</p>
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

  const amHost =
    user?.user_id != null &&
    roomAmbience.active &&
    roomAmbience.host_user_id === Number(user.user_id);

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

  const floatPanelsCompact = playerFloatChatOpen && playerFloatParticipantsOpen;

  useLayoutEffect(() => {
    if (playerIsFs && !prevPlayerFsRef.current) {
      setFloatChatLastSeenId(roomAmbienceMessages.at(-1)?.id ?? 0);
    }
    prevPlayerFsRef.current = playerIsFs;
  }, [playerIsFs, roomAmbienceMessages]);

  useEffect(() => {
    if (playerFloatChatOpen && playerIsFs) {
      const last = roomAmbienceMessages.at(-1)?.id ?? 0;
      setFloatChatLastSeenId(last);
    }
  }, [playerFloatChatOpen, playerIsFs, roomAmbienceMessages]);

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

  const applyPlaybackFromState = useCallback(() => {
    const p = playerRef.current;
    if (!p || !roomAmbience.active || !roomAmbience.video_id) return;
    const targetPos = computeSyncedSeconds(
      roomAmbience.playing,
      roomAmbience.position_sec,
      roomAmbience.sync_epoch_ms,
    );
    try {
      p.seekTo(targetPos, true);
      if (roomAmbience.playing) p.playVideo();
      else p.pauseVideo();
    } catch {
      // ignore
    }
  }, [
    roomAmbience.active,
    roomAmbience.video_id,
    roomAmbience.playing,
    roomAmbience.position_sec,
    roomAmbience.sync_epoch_ms,
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
          playsinline: 1,
          rel: 0,
          controls: amHost ? 1 : 0,
          disablekb: amHost ? 0 : 1,
          fs: amHost ? 1 : 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            const p = playerRef.current;
            if (!p) return;
            p.setVolume(localVolume);
            const targetPos = computeSyncedSeconds(
              roomAmbience.playing,
              roomAmbience.position_sec,
              roomAmbience.sync_epoch_ms,
            );
            try {
              p.seekTo(targetPos, true);
              if (roomAmbience.playing) p.playVideo();
              else p.pauseVideo();
            } catch {
              // ignore
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
      if (mountRef.current) mountRef.current.innerHTML = "";
    };
  }, [entered, roomAmbience.active, roomAmbience.video_id, amHost]);

  useEffect(() => {
    applyPlaybackFromState();
  }, [applyPlaybackFromState]);

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

  const hostControl = (kind: "play" | "pause" | "seek", deltaSec = 0) => {
    const p = playerRef.current;
    if (!p || !amHost) return;
    const cur = p.getCurrentTime?.() ?? 0;
    if (kind === "play") sendRoomAmbience({ action: "play", position_sec: cur });
    if (kind === "pause") sendRoomAmbience({ action: "pause", position_sec: cur });
    if (kind === "seek")
      sendRoomAmbience({ action: "seek", position_sec: Math.max(0, cur + deltaSec) });
  };

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
            {!amHost ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => applyPlaybackFromState()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sincronizar com o host
              </Button>
            ) : null}
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
          <div className="relative min-h-0 flex-1">
            <div ref={mountRef} className="absolute inset-0 h-full w-full" />
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
                  "pointer-events-auto absolute bottom-[3.35rem] left-2 z-[35] flex w-[min(92vw,280px)] flex-col overflow-hidden rounded-xl border border-white/25 bg-zinc-950/92 text-foreground shadow-2xl ring-1 ring-white/10 sm:left-3",
                  floatPanelsCompact ? "max-h-[min(30vh,240px)]" : "max-h-[min(42vh,320px)]",
                )}
              >
                <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-2 py-1.5">
                  <div className="flex min-w-0 items-center gap-1.5 text-white/75">
                    <Users className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-[10px] font-bold uppercase tracking-wide">
                      Na room
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-white hover:bg-white/10"
                    title="Fechar"
                    onClick={() => setPlayerFloatParticipantsOpen(false)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-2">
                  {roomAmbience.viewers.length > 0 ? (
                    roomAmbience.viewers.map((participant) => (
                      <div
                        key={participant.user_id}
                        className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/35 px-2 py-2"
                      >
                        <ProfileAvatar
                          displayName={participant.fullname || participant.username}
                          username={participant.username}
                          profilePhoto={participant.profile_photo}
                          sizeClass="h-8 w-8"
                          fallbackTextClassName="text-[10px]"
                          className="ring-1 ring-white/15"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-white/95">
                            {participant.fullname || participant.username}
                          </p>
                          <p className="truncate text-[11px] text-white/55">@{participant.username}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/55">Ninguém na transmissão agora.</p>
                  )}
                </div>
              </div>
            ) : null}
            {playerIsFs && playerFloatChatOpen ? (
              <div
                className={cn(
                  "pointer-events-auto absolute bottom-[3.35rem] left-2 right-2 z-[35] flex flex-col overflow-hidden rounded-xl border border-white/25 bg-zinc-950/92 text-foreground shadow-2xl ring-1 ring-white/10 sm:left-auto sm:right-3 sm:w-[min(92vw,380px)]",
                  floatPanelsCompact ? "max-h-[min(30vh,260px)]" : "max-h-[min(42vh,340px)]",
                )}
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-2 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-white/75">
                    Chat da Room
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-white/10"
                    title="Fechar chat"
                    onClick={() => setPlayerFloatChatOpen(false)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-2 py-2">
                  {floatChatMessages.map((m) => (
                    <AmbienceChatLine key={m.id} m={m} variant="float" />
                  ))}
                  <div ref={floatChatEndRef} />
                </div>
                <div className="flex shrink-0 gap-2 border-t border-white/10 p-2">
                  <input
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-white/20 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-white/40"
                    placeholder="Comentar…"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), sendComment())}
                  />
                  <Button
                    size="icon"
                    className="shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20"
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
                <p className="text-xs text-white/70">
                  Somente {roomAmbience.host_username} controla a reprodução no YouTube.
                </p>
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
              {roomAmbienceMessages.map((m) => (
                <AmbienceChatLine key={m.id} m={m} />
              ))}
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

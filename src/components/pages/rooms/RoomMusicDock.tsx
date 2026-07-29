"use client";

import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { canManageRoomMusic } from "@/lib/roomPermissions";
import { cn } from "@/lib/utils";
import { usePlaybackTelemetry } from "@/hooks/usePlaybackTelemetry";
import type { MediaTrack, ProviderName } from "@/types/RoomMusic";
import {
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  DeezerMark,
  ProviderPlayer,
  SpotifyMark,
  YoutubeMark,
} from "./players/ProviderPlayer";

// ── YouTube IFrame API types ──────────────────────────────────────────────────

type YtPlayer = {
  destroy: () => void;
  loadVideoById: (arg: { videoId: string; startSeconds?: number } | string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  getPlayerState?: () => number;
  getCurrentTime?: () => number;
};

type YtPlayerHandoff = {
  videoId: string;
  seconds: number;
  wasPlaying: boolean;
};

const YT_ENDED = 0;
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const IFRAME_CLICK_GUARD_MS = 900;

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

// ── Volume persistence ────────────────────────────────────────────────────────

type RoomMusicDockProps = { mountSuffix: string };

function volumeStorageKey(mountSuffix: string) {
  return `playgether:room-music-volume:${mountSuffix}`;
}

function readStoredVolume(mountSuffix: string): number {
  if (typeof window === "undefined") return 80;
  try {
    const raw = localStorage.getItem(volumeStorageKey(mountSuffix));
    const v = Number(raw);
    if (Number.isFinite(v) && v >= 0 && v <= 100) return Math.round(v);
  } catch {
    /* ignore */
  }
  return 80;
}

// ── Track helpers ─────────────────────────────────────────────────────────────

function youtubeThumbUrl(track: MediaTrack) {
  if (track.thumbnail) return track.thumbnail;
  return `https://i.ytimg.com/vi/${track.video_id}/mqdefault.jpg`;
}

function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

function trackOpenUrl(track: MediaTrack): string {
  const p = track.active_provider ?? "youtube";
  if (p === "spotify" && track.providers?.spotify?.track_id) {
    return `https://open.spotify.com/track/${track.providers.spotify.track_id}`;
  }
  if (p === "deezer" && track.providers?.deezer?.track_id) {
    return `https://www.deezer.com/track/${track.providers.deezer.track_id}`;
  }
  return youtubeWatchUrl(track.video_id);
}

function trackOpenLabel(provider: ProviderName): string {
  if (provider === "spotify") return "Ver no Spotify";
  if (provider === "deezer") return "Ver no Deezer";
  return "Ver no YouTube";
}

function ProviderMark({
  provider,
  className,
}: {
  provider: ProviderName;
  className?: string;
}) {
  if (provider === "spotify")
    return <SpotifyMark className={cn(className, "text-[#1DB954]")} />;
  if (provider === "deezer")
    return <DeezerMark className={cn(className, "text-[#A238FF]")} />;
  return <YoutubeMark className={cn(className, "text-[#FF0033]")} />;
}

// ── Non-sync notice (shown for embed-only providers) ─────────────────────────

function EmbedOnlyNotice({ provider }: { provider: ProviderName }) {
  const name = provider === "spotify" ? "Spotify" : "Deezer";
  return (
    <p className="mt-0.5 truncate text-[9px] text-muted-foreground/70">
      Reprodução via {name} — sem sincronização de posição
    </p>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RoomMusicDock({ mountSuffix }: RoomMusicDockProps) {
  const { snapshot } = useRoomPermissions();
  const canPlayback = canManageRoomMusic(snapshot);
  const { roomMusic, sendRoomMusic } = useChatHandlerContext();
  const [expanded, setExpanded] = useState(false);
  const [localIndex, setLocalIndex] = useState(-1);
  const [localVolume, setLocalVolume] = useState(() => readStoredVolume(mountSuffix));
  const [localPaused, setLocalPaused] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [blockIframePointer, setBlockIframePointer] = useState(false);

  const playerRef = useRef<YtPlayer | null>(null);
  const playerHandoffRef = useRef<YtPlayerHandoff | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const localPausedRef = useRef(localPaused);
  const localVolumeRef = useRef(localVolume);
  const roomMusicPlayingRef = useRef(roomMusic.playing);
  const lastLoadVideoAtRef = useRef(0);
  const reactId = useId();
  const playbackStartedRef = useRef(false);
  const localIndexRef = useRef(localIndex);
  const queueLengthRef = useRef(roomMusic.queue.length);
  const sendRoomMusicRef = useRef(sendRoomMusic);

  localPausedRef.current = localPaused;
  localVolumeRef.current = localVolume;
  roomMusicPlayingRef.current = roomMusic.playing;
  localIndexRef.current = localIndex;
  queueLengthRef.current = roomMusic.queue.length;
  sendRoomMusicRef.current = sendRoomMusic;

  const localCurrent_: MediaTrack | null =
    localIndex >= 0 && localIndex < roomMusic.queue.length
      ? roomMusic.queue[localIndex]
      : null;

  const playbackTelemetry = usePlaybackTelemetry({
    roomSlug: mountSuffix,
    provider: localCurrent_?.active_provider ?? "youtube",
    canonicalTrackId: localCurrent_?.canonical_track_id,
  });

  useEffect(() => {
    try {
      localStorage.setItem(volumeStorageKey(mountSuffix), String(localVolume));
    } catch {
      /* ignore */
    }
  }, [localVolume, mountSuffix]);

  useEffect(() => {
    setBlockIframePointer(true);
    const t = window.setTimeout(() => setBlockIframePointer(false), IFRAME_CLICK_GUARD_MS);
    return () => window.clearTimeout(t);
  }, [expanded]);

  const hasSession = roomMusic.queue.length > 0;
  const localCurrent: MediaTrack | null = localCurrent_;

  const activeProvider: ProviderName = localCurrent?.active_provider ?? "youtube";
  const isYouTube = activeProvider === "youtube";

  const title = localCurrent?.title ?? "Música da sala";
  const openUrl = localCurrent ? trackOpenUrl(localCurrent) : "#";

  // ── Sync state from WebSocket ─────────────────────────────────────────────

  useEffect(() => {
    if (roomMusic.queue.length === 0) {
      setLocalIndex(-1);
      return;
    }
    const idx = Math.min(
      Math.max(0, roomMusic.current_index),
      roomMusic.queue.length - 1,
    );
    setLocalIndex(idx);
    setLocalPaused(!roomMusic.playing);
  }, [
    roomMusic.sync_epoch_ms,
    roomMusic.queue.length,
    roomMusic.current_index,
    roomMusic.playing,
  ]);

  // ── YouTube player lifecycle ──────────────────────────────────────────────
  // Only active when active_provider === "youtube"

  useEffect(() => {
    if (!isYouTube) {
      // Destroy any lingering YouTube player when switching away
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      setPlayerReady(false);
      if (mountRef.current) mountRef.current.innerHTML = "";
      return;
    }

    if (!hasSession || !localCurrent || localIndex < 0) {
      try { playerRef.current?.pauseVideo(); } catch { /* ignore */ }
      return;
    }

    let cancelled = false;
    const w = window as Window & {
      YT?: { Player: new (el: HTMLElement | string, opts: unknown) => YtPlayer };
    };

    const videoId = localCurrent.video_id;
    const showNativeControls = expanded;

    void loadYoutubeIframeApi().then(() => {
      if (cancelled || !mountRef.current) return;
      if (mountRef.current) mountRef.current.innerHTML = "";

      const origin = typeof window !== "undefined" ? window.location.origin : "";

      const playerVars: Record<string, number | string> = {
        playsinline: 1,
        rel: 0,
        modestbranding: 0,
        enablejsapi: 1,
        origin,
        fs: showNativeControls ? 1 : 0,
        controls: showNativeControls ? 1 : 0,
        disablekb: showNativeControls ? 0 : 1,
        iv_load_policy: 3,
      };

      const applyInitialPlayback = (p: YtPlayer) => {
        lastLoadVideoAtRef.current = Date.now();
        const handoff = playerHandoffRef.current;
        const useHandoff = handoff?.videoId === videoId;
        const handoffWasPlaying = useHandoff ? handoff!.wasPlaying : false;
        playerHandoffRef.current = null;

        p.loadVideoById({
          videoId,
          startSeconds: useHandoff ? Math.max(0, handoff!.seconds) : 0,
        });
        p.setVolume(localVolumeRef.current);
        if (localVolumeRef.current === 0) p.mute();
        else p.unMute();

        const shouldPlay = useHandoff
          ? handoffWasPlaying && !localPausedRef.current
          : !localPausedRef.current;

        if (shouldPlay) {
          p.playVideo();
          window.setTimeout(() => { if (!localPausedRef.current) p.playVideo(); }, 200);
          window.setTimeout(() => { if (!localPausedRef.current) p.playVideo(); }, 650);
        } else {
          p.pauseVideo();
        }
      };

      playbackStartedRef.current = false;

      playerRef.current = new w.YT!.Player(mountRef.current, {
        height: "100%",
        width: "100%",
        videoId,
        playerVars,
        events: {
          onReady: () => {
            if (cancelled || !playerRef.current) return;
            applyInitialPlayback(playerRef.current);
            setPlayerReady(true);
            try { playbackTelemetry.onPlayerReady(); } catch { /* ignore */ }
          },
          onStateChange: (ev: { data: number }) => {
            if (ev.data === YT_PLAYING) {
              setLocalPaused(false);
              if (!playbackStartedRef.current) {
                playbackStartedRef.current = true;
                try { playbackTelemetry.onPlaybackStarted(); } catch { /* ignore */ }
              }
              return;
            }
            // Video ended — remove it from the queue (backend auto-advances to next)
            if (ev.data === YT_ENDED) {
              const curIdx = localIndexRef.current;
              sendRoomMusicRef.current({ action: "remove", index: curIdx });
              return;
            }
            if (ev.data === YT_PAUSED) {
              if (!roomMusicPlayingRef.current) { setLocalPaused(true); return; }
              if (Date.now() - lastLoadVideoAtRef.current < 1200) {
                try { playerRef.current?.playVideo(); } catch { /* ignore */ }
              }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      const p = playerRef.current;
      const cur = localCurrent;
      if (p && cur) {
        try {
          const t = p.getCurrentTime?.() ?? 0;
          const st = p.getPlayerState?.() ?? YT_PAUSED;
          playerHandoffRef.current = {
            videoId: cur.video_id,
            seconds: Math.max(0, t),
            wasPlaying: st === YT_PLAYING,
          };
        } catch { playerHandoffRef.current = null; }
        try { p.destroy(); } catch { /* ignore */ }
      }
      playerRef.current = null;
      if (mountRef.current) mountRef.current.innerHTML = "";
      setPlayerReady(false);
    };
  }, [isYouTube, hasSession, localIndex, localCurrent?.video_id, expanded]);

  useEffect(() => {
    if (!hasSession) {
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      setPlayerReady(false);
      if (mountRef.current) mountRef.current.innerHTML = "";
    }
  }, [hasSession]);

  useEffect(() => {
    return () => {
      try { playerRef.current?.destroy(); } catch { /* ignore */ }
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, []);

  useEffect(() => {
    if (!isYouTube || !playerReady || !playerRef.current) return;
    try {
      if (localPaused) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } catch { /* ignore */ }
  }, [isYouTube, localPaused, playerReady]);

  useEffect(() => {
    if (!isYouTube || !playerReady || !playerRef.current) return;
    try {
      playerRef.current.setVolume(localVolume);
      if (localVolume === 0) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch { /* ignore */ }
  }, [isYouTube, localVolume, playerReady]);

  // ── Controls ──────────────────────────────────────────────────────────────

  const openExpanded = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault(); e?.stopPropagation(); setExpanded(true);
  }, []);

  const closeExpanded = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault(); e?.stopPropagation(); setExpanded(false);
  }, []);

  const togglePlay = () => {
    if (!localCurrent) return;
    if (isYouTube) {
      const p = playerRef.current;
      if (!p) return;
      try {
        if (localPaused) { p.playVideo(); setLocalPaused(false); }
        else { p.pauseVideo(); setLocalPaused(true); }
      } catch { /* ignore */ }
    } else {
      // For embed providers there is no programmatic play/pause,
      // but we still update shared room state for visual consistency.
      if (localPaused) sendRoomMusic({ action: "play" });
      else sendRoomMusic({ action: "pause", position_sec: 0 });
      setLocalPaused((p) => !p);
    }
  };

  const onVolumeInput = (v: number) => {
    const next = Math.max(0, Math.min(100, Math.round(v)));
    setLocalVolume(next);
    if (isYouTube) {
      try {
        playerRef.current?.setVolume(next);
        if (next === 0) playerRef.current?.mute();
        else playerRef.current?.unMute();
      } catch { /* ignore */ }
    }
  };

  const goPrev = () => {
    if (!canPlayback) return;
    const next = Math.max(0, localIndex - 1);
    sendRoomMusic({ action: "select", index: next });
  };

  const goNext = () => {
    if (!canPlayback) return;
    const next = Math.min(roomMusic.queue.length - 1, localIndex + 1);
    sendRoomMusic({ action: "select", index: next });
  };

  if (!hasSession || !localCurrent) return null;

  const blockPlayerPointer = !expanded || blockIframePointer;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="shrink-0 border-t border-border/60 bg-card/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="relative flex min-h-[52px] flex-col gap-1.5 px-2 py-1.5 md:flex-row md:flex-wrap md:items-center md:gap-x-2 md:gap-y-2">
        {!expanded ? (
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Expandir player"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => openExpanded(e)}
          />
        ) : null}

        <div className="relative z-30 flex w-full min-w-0 flex-1 flex-col gap-1.5 pointer-events-none md:flex-row md:flex-wrap md:items-center md:gap-x-2 md:gap-y-2">

          {/* Thumbnail + track info */}
          <div className="relative flex min-w-0 w-full flex-1 items-center gap-2 md:w-auto md:gap-2.5">
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-[42] shrink-0 rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 pointer-events-auto"
              title={trackOpenLabel(activeProvider)}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumbUrl(localCurrent)}
                alt=""
                className="pointer-events-none h-9 w-12 rounded-md border border-border/50 object-cover md:h-11 md:w-[62px]"
              />
              {!expanded ? (
                <span
                  className="absolute -bottom-0.5 -right-0.5 flex rounded bg-card/95 p-0.5 shadow-sm ring-1 ring-border/60 md:hidden"
                  aria-hidden
                >
                  <ProviderMark provider={activeProvider} className="h-2.5 w-3.5" />
                </span>
              ) : null}
            </a>

            <div className="relative flex min-w-0 flex-1 items-center gap-1.5 md:gap-2">
              <div className="min-w-0 flex-1 pointer-events-none">
                <p className="hidden truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:block">
                  🎧 Agora tocando
                </p>
                <p className="truncate text-xs font-medium text-foreground">{title}</p>
                {localCurrent.artist ? (
                  <p className="truncate text-[10px] text-muted-foreground/80">
                    {localCurrent.artist}
                  </p>
                ) : null}
                <p className="mt-0.5 hidden flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-medium text-muted-foreground/90 md:flex">
                  <ProviderMark provider={activeProvider} className="h-3 w-4 shrink-0" />
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto text-primary underline-offset-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    {trackOpenLabel(activeProvider)}
                  </a>
                </p>
                {!isYouTube ? <EmbedOnlyNotice provider={activeProvider} /> : null}
              </div>

              {expanded ? (
                <button
                  type="button"
                  onClick={(e) => closeExpanded(e)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="pointer-events-auto relative z-[42] shrink-0 rounded-md p-1 text-muted-foreground outline-none ring-offset-background hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Recolher player"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
              ) : (
                <ChevronDown
                  className="pointer-events-none h-4 w-4 shrink-0 text-muted-foreground opacity-60"
                  aria-hidden
                />
              )}
            </div>
          </div>

          {/* Player surface — fora do fluxo no mobile recolhido (áudio continua); layout desktop intacto */}
          <div
            className={cn(
              "relative z-[38] shrink-0 overflow-hidden rounded-md border border-border/60 bg-black shadow-inner transition-all duration-200",
              expanded
                ? "order-none h-[min(36vw,160px)] w-full pointer-events-auto md:order-last md:h-[200px] md:max-w-[360px]"
                : "pointer-events-none max-md:absolute max-md:left-0 max-md:top-0 max-md:h-px max-md:w-px max-md:overflow-hidden max-md:border-0 max-md:opacity-0 md:relative md:h-[68px] md:w-[120px] md:opacity-100",
              !expanded && "[&_iframe]:pointer-events-none",
              expanded && blockIframePointer && "[&_iframe]:pointer-events-none",
            )}
          >
            <ProviderPlayer
              track={localCurrent}
              youtubeMount={mountRef}
              expanded={expanded}
              blockPointer={blockPlayerPointer}
              roomSlug={mountSuffix}
              className="h-full w-full"
            />
          </div>

          {/* Transport + volume — segunda linha no mobile; no desktop volta ao fluxo horizontal */}
          <div className="relative z-[42] flex w-full min-w-0 items-center gap-2 pointer-events-auto md:contents">
            <div className="relative z-[42] flex shrink-0 items-center gap-0.5 pointer-events-auto">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={localIndex <= 0}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 md:p-2"
                title="Faixa anterior (sala)"
              >
                <SkipBack className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-full gradient-primary p-1.5 text-primary-foreground shadow-sm disabled:opacity-40 md:p-2"
                title={localPaused ? "Tocar" : "Pausar"}
              >
                {localPaused ? (
                  <Play className="h-3.5 w-3.5 md:h-4 md:w-4" />
                ) : (
                  <Pause className="h-3.5 w-3.5 md:h-4 md:w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={localIndex >= roomMusic.queue.length - 1}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-30 md:p-2"
                title="Próxima faixa (sala)"
              >
                <SkipForward className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </button>
            </div>

            <div className="relative z-[42] flex min-w-0 flex-1 items-center gap-1 pointer-events-auto md:max-w-[140px] md:flex-none">
              <Volume2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                type="range"
                min={0}
                max={100}
                value={localVolume}
                onChange={(e) => onVolumeInput(Number(e.target.value))}
                onPointerDown={(e) => e.stopPropagation()}
                className="h-1 w-full cursor-pointer accent-primary"
                aria-label="Volume neste aparelho"
              />
            </div>
          </div>

          {expanded ? (
            <p className="relative z-[42] flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/90 pointer-events-auto md:hidden">
              <ProviderMark provider={activeProvider} className="h-3 w-4 shrink-0" />
              <a
                href={openUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {trackOpenLabel(activeProvider)}
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

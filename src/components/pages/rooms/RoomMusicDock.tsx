"use client";

import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { cn } from "@/lib/utils";
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
};

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

type RoomMusicDockProps = {
  mountSuffix: string;
};

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

function youtubeThumbUrl(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
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

export function RoomMusicDock({ mountSuffix }: RoomMusicDockProps) {
  const { roomMusic, sendRoomMusic } = useChatHandlerContext();
  const [expanded, setExpanded] = useState(false);
  const [localIndex, setLocalIndex] = useState(-1);
  const [localVolume, setLocalVolume] = useState(() => readStoredVolume(mountSuffix));
  const [localPaused, setLocalPaused] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  /** Bloqueia cliques no iframe logo após trocar expand — evita “clique fantasma” no vídeo */
  const [blockIframePointer, setBlockIframePointer] = useState(false);
  const playerRef = useRef<YtPlayer | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const localPausedRef = useRef(localPaused);
  const localVolumeRef = useRef(localVolume);
  const roomMusicPlayingRef = useRef(roomMusic.playing);
  const lastLoadVideoAtRef = useRef(0);
  const reactId = useId();
  const playerDomId = `yt-room-${mountSuffix}-${reactId.replace(/:/g, "")}`;

  localPausedRef.current = localPaused;
  localVolumeRef.current = localVolume;
  roomMusicPlayingRef.current = roomMusic.playing;

  useEffect(() => {
    try {
      localStorage.setItem(volumeStorageKey(mountSuffix), String(localVolume));
    } catch {
      /* ignore */
    }
  }, [localVolume, mountSuffix]);

  useEffect(() => {
    setBlockIframePointer(true);
    const t = window.setTimeout(
      () => setBlockIframePointer(false),
      IFRAME_CLICK_GUARD_MS,
    );
    return () => window.clearTimeout(t);
  }, [expanded]);

  const hasSession = roomMusic.queue.length > 0;
  const localCurrent =
    localIndex >= 0 && localIndex < roomMusic.queue.length
      ? roomMusic.queue[localIndex]
      : null;
  const title = localCurrent?.title ?? "Música da sala";

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

  useEffect(() => {
    if (!hasSession || !localCurrent || localIndex < 0) {
      try {
        playerRef.current?.pauseVideo();
      } catch {
        /* ignore */
      }
      return;
    }

    let cancelled = false;
    const w = window as Window & {
      YT?: { Player: new (el: HTMLElement | string, opts: unknown) => YtPlayer };
    };

    void loadYoutubeIframeApi().then(() => {
      if (cancelled || !mountRef.current) return;
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const initialId = localCurrent.video_id;

      if (!playerRef.current) {
        /** Um único iframe: sem recriar ao expandir (evita “mini reload”). Controles nativos ficam
         *  desativados para clique no modo recolhido via `pointer-events-none` no iframe. */
        const playerVars: Record<string, number | string> = {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin,
          fs: 1,
          controls: 1,
          disablekb: 0,
          iv_load_policy: 3,
        };

        playerRef.current = new w.YT!.Player(mountRef.current, {
          height: "100%",
          width: "100%",
          videoId: initialId,
          playerVars,
          events: {
            onReady: () => setPlayerReady(true),
            onStateChange: (ev: { data: number }) => {
              if (ev.data === YT_PLAYING) {
                setLocalPaused(false);
                return;
              }
              if (ev.data === YT_PAUSED || ev.data === 0) {
                if (!roomMusicPlayingRef.current) {
                  setLocalPaused(true);
                  return;
                }
                if (Date.now() - lastLoadVideoAtRef.current < 1200) {
                  try {
                    playerRef.current?.playVideo();
                  } catch {
                    /* ignore */
                  }
                }
              }
            },
          },
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasSession, localIndex, localCurrent?.video_id]);

  useEffect(() => {
    if (!hasSession) {
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      setPlayerReady(false);
      if (mountRef.current) mountRef.current.innerHTML = "";
    }
  }, [hasSession]);

  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, []);

  useEffect(() => {
    if (!playerReady || !playerRef.current || !localCurrent) return;
    const p = playerRef.current;
    try {
      lastLoadVideoAtRef.current = Date.now();
      p.loadVideoById({ videoId: localCurrent.video_id, startSeconds: 0 });
      p.setVolume(localVolumeRef.current);
      if (localVolumeRef.current === 0) p.mute();
      else p.unMute();
      if (localPausedRef.current) p.pauseVideo();
      else {
        p.playVideo();
        const t1 = window.setTimeout(() => {
          if (!localPausedRef.current) p.playVideo();
        }, 200);
        const t2 = window.setTimeout(() => {
          if (!localPausedRef.current) p.playVideo();
        }, 650);
        return () => {
          window.clearTimeout(t1);
          window.clearTimeout(t2);
        };
      }
    } catch {
      /* ignore */
    }
  }, [localCurrent?.video_id, playerReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    try {
      if (localPaused) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } catch {
      /* ignore */
    }
  }, [localPaused, playerReady]);

  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    try {
      playerRef.current.setVolume(localVolume);
      if (localVolume === 0) playerRef.current.mute();
      else playerRef.current.unMute();
    } catch {
      /* ignore */
    }
  }, [localVolume, playerReady]);

  const openExpanded = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setExpanded(true);
  }, []);

  const closeExpanded = useCallback((e?: React.MouseEvent | React.PointerEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setExpanded(false);
  }, []);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p || !localCurrent) return;
    try {
      if (localPaused) {
        p.playVideo();
        setLocalPaused(false);
      } else {
        p.pauseVideo();
        setLocalPaused(true);
      }
    } catch {
      /* ignore */
    }
  };

  const onVolumeInput = (v: number) => {
    const next = Math.max(0, Math.min(100, Math.round(v)));
    setLocalVolume(next);
    try {
      playerRef.current?.setVolume(next);
      if (next === 0) playerRef.current?.mute();
      else playerRef.current?.unMute();
    } catch {
      /* ignore */
    }
  };

  const goPrev = () => {
    const next = Math.max(0, localIndex - 1);
    sendRoomMusic({ action: "select", index: next });
  };

  const goNext = () => {
    const next = Math.min(roomMusic.queue.length - 1, localIndex + 1);
    sendRoomMusic({ action: "select", index: next });
  };

  if (!hasSession || !localCurrent) return null;

  const blockPlayerSurfacePointer =
    !expanded || blockIframePointer;

  return (
    <div className="shrink-0 border-t border-border/60 bg-card/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
      <div className="relative flex min-h-[52px] flex-wrap items-center gap-x-2 gap-y-2 px-2 py-1.5">
        {!expanded ? (
          <button
            type="button"
            className="absolute inset-0 z-20 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Expandir player"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => openExpanded(e)}
          />
        ) : (
          <button
            type="button"
            className="absolute inset-0 z-[22] cursor-pointer border-0 bg-transparent p-0"
            aria-label="Recolher player"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => closeExpanded(e)}
          />
        )}

        <div className="relative z-30 flex w-full min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-2 pointer-events-none">
          <div className="relative flex min-w-0 flex-1 items-center gap-2.5">
            <a
              href={youtubeWatchUrl(localCurrent.video_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-[42] shrink-0 rounded-md outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 pointer-events-auto"
              title="Abrir no YouTube"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumbUrl(localCurrent.video_id)}
                alt=""
                className="pointer-events-none h-11 w-[62px] rounded-md border border-border/50 object-cover"
              />
            </a>

            <div className="relative flex min-w-0 flex-1 items-center gap-2">
              <div className="min-w-0 flex-1 pointer-events-none">
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  🎧 Agora tocando
                </p>
                <p className="truncate text-xs font-medium text-foreground">{title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-medium text-muted-foreground/90">
                  <YoutubeMark className="h-3 w-4 shrink-0 text-[#FF0033]" />
                  <a
                    href={youtubeWatchUrl(localCurrent.video_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto text-primary underline-offset-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    Ver no YouTube
                  </a>
                </p>
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

          <div
            className={cn(
              "relative z-[38] shrink-0 overflow-hidden rounded-md border border-border/60 bg-black shadow-inner transition-all duration-200",
              expanded
                ? "order-last h-[min(42vw,220px)] w-full max-w-[360px] sm:h-[200px]"
                : "h-[68px] w-[120px] pointer-events-none",
              !expanded && "[&_iframe]:pointer-events-none",
              expanded && blockIframePointer && "[&_iframe]:pointer-events-none",
            )}
          >
            <div
              ref={mountRef}
              id={playerDomId}
              className={cn(
                "relative z-0 h-full w-full",
                blockPlayerSurfacePointer && "pointer-events-none",
              )}
            />
          </div>

          <div className="relative z-[42] flex shrink-0 items-center gap-0.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={localIndex <= 0}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
              title="Faixa anterior (sala)"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded-full gradient-primary p-2 text-primary-foreground shadow-sm disabled:opacity-40"
              title={localPaused ? "Tocar" : "Pausar"}
            >
              {localPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={localIndex >= roomMusic.queue.length - 1}
              className="rounded-md p-2 text-muted-foreground hover:bg-muted disabled:opacity-30"
              title="Próxima faixa (sala)"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>

          <div className="relative z-[42] flex min-w-[100px] flex-1 items-center gap-1 pointer-events-auto sm:max-w-[140px] sm:flex-none">
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
      </div>
    </div>
  );
}

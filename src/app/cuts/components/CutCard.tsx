"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Volume2,
  Volume1,
  VolumeX,
  Send,
  Play,
  Pause,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Cut } from "@/types/Cut";
import { getCloudinaryVideoUrl, getCloudinaryVideoThumbnail } from "@/app/utils/getCloudinaryVideo";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { CutOptionsMenu } from "./CutOptionsMenu";
import { CutShareDialog } from "./CutShareDialog";
import { BookmarkButton } from "@/components/ui/BookmarkButton";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const VOLUME_STORAGE_KEY = "pgther:cut-volume";

function getStoredVolume(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(VOLUME_STORAGE_KEY);
  const parsed = raw !== null ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 1;
}

interface CutCardProps {
  cut: Cut;
  isActive: boolean;
  isAuthenticated?: boolean;
  onOpenComments: (cut: Cut) => void;
  commentsActive?: boolean;
}

type Pulse = { type: "play" | "pause" | "like"; key: number };

export function CutCard({ cut, isActive, isAuthenticated, onOpenComments, commentsActive }: CutCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [pulse, setPulse] = useState<Pulse | null>(null);

  const [liked, setLiked] = useState(cut.user_already_like);
  const [likesCount, setLikesCount] = useState(cut.likes_count);
  const [viewSent, setViewSent] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const lastTapRef = useRef(0);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pulseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerPulse = useCallback((type: Pulse["type"]) => {
    if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
    setPulse({ type, key: Date.now() });
    pulseTimeoutRef.current = setTimeout(() => setPulse(null), 650);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
      setProgressPct(0);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onLoadedMeta = () => setDuration(video.duration || 0);
    const onTimeUpdate = () => {
      if (!isSeeking && video.duration) {
        setProgressPct((video.currentTime / video.duration) * 100);
      }
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("loadedmetadata", onLoadedMeta);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("loadedmetadata", onLoadedMeta);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [isSeeking]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isActive || viewSent) return;
    const onTime = () => {
      if (video.currentTime >= 2) {
        setViewSent(true);
        fetch(`/api/cuts/${cut.id}/view`, {
          method: "POST",
          credentials: "include",
        }).catch(() => {});
      }
    };
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, [isActive, viewSent, cut.id]);

  const toggleLike = useCallback(async () => {
    if (!isAuthenticated) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => c + (wasLiked ? -1 : 1));
    try {
      await fetch(`/api/cuts/${cut.id}/likes`, {
        method: wasLiked ? "DELETE" : "POST",
        credentials: "include",
      });
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => c + (wasLiked ? 1 : -1));
    }
  }, [liked, cut.id, isAuthenticated]);

  const handleLikeClick = useCallback(() => {
    triggerPulse("like");
    toggleLike();
  }, [toggleLike, triggerPulse]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      triggerPulse("play");
    } else {
      video.pause();
      triggerPulse("pause");
    }
  }, [triggerPulse]);

  const handleVideoTap = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;
    if (delta < 280) {
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      if (!liked) toggleLike();
      triggerPulse("like");
    } else {
      singleTapTimeoutRef.current = setTimeout(() => {
        togglePlayPause();
      }, 280);
    }
  }, [liked, toggleLike, triggerPulse, togglePlayPause]);

  // ── Volume ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setVolume(getStoredVolume());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VOLUME_STORAGE_KEY, String(volume));
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted || volume === 0;
  }, [volume, muted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    setMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      if (!next && volume === 0) setVolume(1);
      return next;
    });
  }, [volume]);

  // ── Seek / progress bar ──────────────────────────────────────────────────
  const seekFromClientX = useCallback((clientX: number) => {
    const video = videoRef.current;
    const bar = barRef.current;
    if (!video || !bar || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgressPct(ratio * 100);
    return ratio;
  }, []);

  const handleBarPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSeeking(true);
    seekFromClientX(e.clientX);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [seekFromClientX]);

  const handleBarPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const bar = barRef.current;
    if (bar) {
      const rect = bar.getBoundingClientRect();
      setHoverRatio(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
    }
    if (isSeeking) seekFromClientX(e.clientX);
  }, [isSeeking, seekFromClientX]);

  const handleBarPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsSeeking(false);
  }, []);

  const avatarSrc = cut.profile_photo ? getCloudinaryUrl(cut.profile_photo) : null;
  const thumbSrc = cut.video_file ? getCloudinaryVideoThumbnail(cut.video_file) : null;
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black">
      <div className="flex h-full items-center justify-center gap-3 px-2">
        {/* Video — centralizado, object-contain pra não cortar */}
        <div className="relative flex h-full w-fit max-w-full items-center justify-center lg:max-w-[420px]">
          {/* Backdrop desfocado — preenche o espaço vazio de vídeos pequenos/paisagem */}
          {thumbSrc && (
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <Image src={thumbSrc} alt="" fill className="scale-125 object-cover opacity-60 blur-3xl" />
              <div className="absolute inset-0 bg-black/50" />
            </div>
          )}

          <video
            ref={videoRef}
            src={getCloudinaryVideoUrl(cut.video_file)}
            className="relative h-full max-h-full w-auto max-w-full object-contain"
            loop
            playsInline
            preload="metadata"
            onClick={handleVideoTap}
          />

          {/* Ícone estático enquanto pausado (sem animação, permanece até retomar) */}
          {!playing && !pulse && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40">
                <Play className="h-8 w-8 fill-white text-white" />
              </span>
            </div>
          )}

          {/* Feedback visual central (play/pause/like) */}
          <AnimatePresence>
            {pulse && (
              <motion.div
                key={pulse.key}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1.15 }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-black/35">
                  {pulse.type === "play" && <Play className="h-10 w-10 fill-white text-white" />}
                  {pulse.type === "pause" && <Pause className="h-10 w-10 fill-white text-white" />}
                  {pulse.type === "like" && <Heart className="h-14 w-14 fill-red-500 text-red-500" />}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient bottom overlay */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/85 to-transparent" />

          {/* Volume — controle do player, ancorado no canto superior direito do vídeo */}
          <div
            className={cn(
              "absolute right-4 top-4 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 py-1.5 pl-1.5 pr-1.5 shadow-lg backdrop-blur-md transition-[padding]",
              showVolumeSlider && "pr-3",
            )}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
            onClick={() => setShowVolumeSlider((v) => !v)}
          >
            <button
              type="button"
              aria-label={muted ? "Ativar som" : "Silenciar"}
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-white"
            >
              <VolumeIcon className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
              aria-label="Volume"
              className={cn(
                "h-1 cursor-pointer appearance-none rounded-full bg-white/30 accent-white transition-all duration-300 ease-out",
                showVolumeSlider ? "w-16 opacity-100" : "w-0 opacity-0",
              )}
            />
          </div>

          {/* Actions — overlay no mobile/tablet, ficam na coluna ao lado no desktop */}
          <div className="absolute bottom-6 right-3 z-20 flex flex-col items-center gap-5 lg:hidden">
            <ActionBtn onClick={handleLikeClick} label={liked ? "Descurtir" : "Curtir"} count={likesCount} icon={<Heart className={cn("h-7 w-7 transition-transform active:scale-125", liked ? "fill-red-500 text-red-500" : "text-white")} />} />
            <ActionBtn onClick={() => onOpenComments(cut)} label="Comentários" count={cut.comments_count} icon={<MessageCircle className={cn("h-7 w-7", commentsActive ? "fill-white/20 text-primary" : "text-white")} />} />
            <ActionBtn onClick={() => setShareOpen(true)} label="Compartilhar" icon={<Send className="h-7 w-7 text-white" />} />
            <BookmarkButton
              item={cut}
              contentType="cut"
              size="lg"
              triggerClassName="h-auto w-auto p-0 text-white hover:text-white hover:bg-transparent active:scale-125 transition-transform"
            />
            <CutOptionsMenu cut={cut} onShare={() => setShareOpen(true)} />
          </div>

          {/* Rodapé: barra de progresso SEMPRE acima do bloco de info — nunca sobrepõe avatar/nome/descrição */}
          <div className="absolute inset-x-3 bottom-3 z-20 flex flex-col gap-2.5 lg:right-4">
            {/* Barra de progresso — seek por clique/arraste, hover mostra tempo (desktop) */}
            <div
              ref={barRef}
              onPointerDown={handleBarPointerDown}
              onPointerMove={handleBarPointerMove}
              onPointerUp={handleBarPointerUp}
              onPointerLeave={() => setHoverRatio(null)}
              className="group relative flex h-4 w-full shrink-0 cursor-pointer items-center pr-14 lg:pr-0"
            >
              <div className="relative h-1 w-full rounded-full bg-white/25">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${progressPct}%` }}
                />
                {hoverRatio !== null && (
                  <div
                    className="absolute -top-7 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white"
                    style={{ left: `${hoverRatio * 100}%` }}
                  >
                    {formatTime(hoverRatio * duration)}
                  </div>
                )}
                <div
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ left: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* User info + caption */}
            <div className="pr-14 lg:pr-0">
              <Link
                href={`/profile/${cut.username}`}
                className="mb-1.5 flex items-center gap-2"
              >
                <span className="flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white/70">
                  {avatarSrc ? (
                    <Image src={avatarSrc} alt={cut.username} width={32} height={32} className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-sm font-bold text-white">
                      {cut.username[0].toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-sm font-bold text-white drop-shadow">@{cut.username}</span>
              </Link>
              {cut.caption && (
                <p className="line-clamp-2 text-sm text-white/90 drop-shadow">{cut.caption}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions — coluna ao lado do vídeo, só desktop */}
        <div className="hidden h-full shrink-0 flex-col items-center justify-center gap-6 lg:flex">
          <ActionBtn onClick={handleLikeClick} label={liked ? "Descurtir" : "Curtir"} count={likesCount} icon={<Heart className={cn("h-7 w-7 transition-transform active:scale-125", liked ? "fill-red-500 text-red-500" : "text-white")} />} />
          <ActionBtn onClick={() => onOpenComments(cut)} label="Comentários" count={cut.comments_count} icon={<MessageCircle className={cn("h-7 w-7", commentsActive ? "fill-white/20 text-primary" : "text-white")} />} />
          <ActionBtn onClick={() => setShareOpen(true)} label="Compartilhar" icon={<Send className="h-7 w-7 text-white" />} />
          <BookmarkButton
            item={cut}
            contentType="cut"
            size="lg"
            triggerClassName="h-auto w-auto p-0 text-white hover:text-white hover:bg-transparent active:scale-125 transition-transform"
          />
          <CutOptionsMenu cut={cut} onShare={() => setShareOpen(true)} />
        </div>
      </div>

      <CutShareDialog cut={cut} open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}

function ActionBtn({
  onClick,
  label,
  icon,
  count,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex flex-col items-center gap-1 transition-transform active:scale-90"
    >
      {icon}
      {count !== undefined && (
        <span className="text-xs font-semibold text-white drop-shadow">{formatCount(count)}</span>
      )}
    </button>
  );
}

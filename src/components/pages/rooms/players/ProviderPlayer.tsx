"use client";

import { cn } from "@/lib/utils";
import type { MediaTrack, ProviderName } from "@/types/RoomMusic";
import { useRuntimeFallbackTracking } from "@/hooks/useRuntimeFallbackTracking";
import { SpotifyPlayer } from "./SpotifyPlayer";
import { DeezerPlayer } from "./DeezerPlayer";
import { ProviderDebugOverlay } from "./ProviderDebugOverlay";

// ── Provider badge icons ─────────────────────────────────────────────────────

function SpotifyMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.24-3.021-1.858-6.832-2.278-11.322-1.237-.422.1-.851-.16-.95-.581-.1-.421.16-.85.582-.95 4.91-1.121 9.12-.641 12.51 1.43.38.25.49.731.241 1.1l.04-.002zm1.47-3.27c-.301.461-.921.6-1.381.301-3.46-2.121-8.731-2.74-12.831-1.5-.5.15-1.03-.14-1.18-.641-.15-.5.14-1.03.641-1.18 4.67-1.411 10.47-.73 14.44 1.71.46.3.601.921.3 1.381l.011-.071zm.13-3.4C15.5 8.519 8.88 8.339 5.171 9.371c-.6.169-1.23-.17-1.4-.77-.17-.6.17-1.23.77-1.4 4.3-1.27 11.45-1.02 15.97 1.62.54.32.721 1.02.4 1.561-.32.54-1.021.721-1.561.4l-.629-.002z"
      />
    </svg>
  );
}

function DeezerMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M18.944 16.338H24v2.043h-5.056v-2.043zm0-3.42H24v2.042h-5.056v-2.042zm0-3.42H24v2.043h-5.056V9.498zm0-3.42H24v2.042h-5.056V6.078zm-6.472 10.26h5.056v2.043h-5.056v-2.043zm0-3.42h5.056v2.042h-5.056v-2.042zm0-3.42h5.056v2.043h-5.056V9.498zm-6.472 6.84h5.056v2.043H6v-2.043zm0-3.42h5.056v2.042H6v-2.042zm-6 3.42h5.056v2.043H0v-2.043z"
      />
    </svg>
  );
}

function YoutubeMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 18" aria-hidden xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M23.5 4.2c-.3-1.1-1.2-2-2.3-2.3C19.3 1.2 12 1.2 12 1.2s-7.3 0-9.2.7c-1.1.3-2 1.2-2.3 2.3C0 6.1 0 9 0 9s0 2.9.5 4.8c.3 1.1 1.2 2 2.3 2.3 1.9.7 9.2.7 9.2.7s7.3 0 9.2-.7c1.1-.3 2-1.2 2.3-2.3.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8zM9.5 12.4V5.6L15.7 9 9.5 12.4z"
      />
    </svg>
  );
}

// ── Provider badge ────────────────────────────────────────────────────────────

type ProviderBadgeProps = { provider: ProviderName };

function ProviderBadge({ provider }: ProviderBadgeProps) {
  if (provider === "spotify") {
    return (
      <div className="pointer-events-none absolute right-1 top-1 z-10 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 shadow-sm">
        <SpotifyMark className="h-2.5 w-2.5 shrink-0 text-[#1DB954]" />
        <span className="text-[9px] font-semibold text-white/90">Spotify</span>
      </div>
    );
  }
  if (provider === "deezer") {
    return (
      <div className="pointer-events-none absolute right-1 top-1 z-10 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 shadow-sm">
        <DeezerMark className="h-2.5 w-2.5 shrink-0 text-[#A238FF]" />
        <span className="text-[9px] font-semibold text-white/90">Deezer</span>
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute right-1 top-1 z-10 flex items-center rounded bg-black/55 px-1 py-0.5 shadow-sm">
      <YoutubeMark className="h-2 w-[11px] shrink-0 text-white" />
    </div>
  );
}

// ── ProviderPlayer ────────────────────────────────────────────────────────────

export type ProviderPlayerProps = {
  track: MediaTrack;
  /** Div ref where the YouTube IFrame API will mount its player element. */
  youtubeMount: React.RefObject<HTMLDivElement | null>;
  /** Whether the YouTube iframe should show native controls (expanded view). */
  expanded: boolean;
  blockPointer: boolean;
  className?: string;
  /** Called when the user (or code) wants to switch to a different provider. */
  onFallback?: (next: ProviderName) => void;
  /** Room slug for telemetry. */
  roomSlug?: string;
};

/**
 * Renders the correct player surface based on `track.active_provider`.
 *
 * - youtube  → the provided `youtubeMount` div (IFrame API mounts here)
 * - spotify  → Spotify Embed iframe (no programmatic sync)
 * - deezer   → Deezer Widget iframe (no programmatic sync)
 *
 * The YouTube IFrame lifecycle (create / destroy / seek) is managed by the
 * parent `RoomMusicDock` – this component only handles the render surface.
 */
export function ProviderPlayer({
  track,
  youtubeMount,
  expanded,
  blockPointer,
  className,
  roomSlug = "",
}: ProviderPlayerProps) {
  const provider = track.active_provider ?? "youtube";
  const providers = track.providers ?? {};

  useRuntimeFallbackTracking({
    roomSlug,
    canonicalTrackId: track.canonical_track_id,
    activeProvider: track.active_provider,
  });

  // ── Spotify ──────────────────────────────────────────────────────────────
  if (provider === "spotify") {
    const sp = providers.spotify;
    if (sp?.embed_url) {
      return (
        <div className={cn("relative h-full w-full", className)}>
          <SpotifyPlayer
            embedUrl={sp.embed_url}
            compact={!expanded}
            className="h-full w-full"
          />
          <ProviderBadge provider="spotify" />
          <ProviderDebugOverlay track={track} />
        </div>
      );
    }
  }

  // ── Deezer ───────────────────────────────────────────────────────────────
  if (provider === "deezer") {
    const dz = providers.deezer;
    if (dz?.embed_url) {
      return (
        <div className={cn("relative h-full w-full", className)}>
          <DeezerPlayer embedUrl={dz.embed_url} className="h-full w-full" />
          <ProviderBadge provider="deezer" />
          <ProviderDebugOverlay track={track} />
        </div>
      );
    }
  }

  // ── YouTube (default / fallback) ─────────────────────────────────────────
  return (
    <div className={cn("relative h-full w-full", className)}>
      <div
        ref={youtubeMount as React.RefObject<HTMLDivElement>}
        className={cn(
          "relative z-0 h-full w-full",
          blockPointer && "pointer-events-none",
        )}
      />
      <ProviderBadge provider="youtube" />
      <ProviderDebugOverlay track={track} />
    </div>
  );
}

// ── Re-export marks for use in RoomMusicDock ─────────────────────────────────
export { SpotifyMark, DeezerMark, YoutubeMark };

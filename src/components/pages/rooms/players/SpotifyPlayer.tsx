"use client";

import { cn } from "@/lib/utils";

type SpotifyPlayerProps = {
  embedUrl: string;
  compact?: boolean;
  className?: string;
};

/**
 * Renders the official Spotify Embed iframe.
 * Playback is fully controlled inside the iframe (no programmatic API).
 */
export function SpotifyPlayer({ embedUrl, compact = false, className }: SpotifyPlayerProps) {
  const src = compact
    ? embedUrl.includes("?")
      ? `${embedUrl}&compact=true`
      : `${embedUrl}?compact=true`
    : embedUrl;

  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className={cn("rounded-md border-0 bg-black", className)}
      title="Spotify player"
    />
  );
}

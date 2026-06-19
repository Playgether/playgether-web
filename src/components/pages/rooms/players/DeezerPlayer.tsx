"use client";

import { cn } from "@/lib/utils";

type DeezerPlayerProps = {
  embedUrl: string;
  className?: string;
};

/**
 * Renders the official Deezer Widget iframe.
 * Playback is fully controlled inside the iframe (no programmatic API).
 */
export function DeezerPlayer({ embedUrl, className }: DeezerPlayerProps) {
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="100%"
      allow="autoplay; encrypted-media"
      loading="lazy"
      className={cn("rounded-md border-0 bg-black", className)}
      title="Deezer player"
    />
  );
}

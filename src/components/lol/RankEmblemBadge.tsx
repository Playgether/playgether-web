"use client";

import { cn } from "@/lib/utils";

type RankEmblemBadgeProps = {
  src: string;
  alt?: string;
  className?: string;
  zoomPercent?: number;
};

/** Circular rank emblem for compact duo badges — centered crop. */
export function RankEmblemBadge({
  src,
  alt = "",
  className,
  zoomPercent = 168,
}: RankEmblemBadgeProps) {
  return (
    <span
      className={cn(
        "relative inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/50 bg-gradient-to-b from-muted/50 to-muted/20",
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        className="pointer-events-none absolute left-1/2 top-1/2 max-h-none max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
        style={{ width: `${zoomPercent}%`, height: `${zoomPercent}%` }}
      />
    </span>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import { cn } from "@/lib/utils";

type GameMediaSize = "icon" | "banner" | "asset";

const SIZE_WIDTH: Record<GameMediaSize, number> = {
  icon: 256,
  banner: 720,
  asset: 256,
};

type GameMediaImageProps = {
  src: string | null | undefined;
  alt: string;
  size?: GameMediaSize;
  className?: string;
  imgClassName?: string;
  spinnerClassName?: string;
  objectFit?: "contain" | "cover";
  fallback?: ReactNode;
};

export function GameMediaImage({
  src,
  alt,
  size = "icon",
  className,
  imgClassName,
  spinnerClassName = "h-5 w-5",
  objectFit = "contain",
  fallback = null,
}: GameMediaImageProps) {
  const resolved = resolveGameMediaUrl(src, SIZE_WIDTH[size]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) return <>{fallback}</>;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!loaded ? (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-muted/40">
          <LoadingComponent showText={false} className={spinnerClassName} />
        </div>
      ) : null}
      <img
        src={resolved}
        alt={alt}
        decoding="async"
        className={cn(
          "h-full w-full transition-opacity duration-200",
          objectFit === "cover" ? "object-cover" : "object-contain",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

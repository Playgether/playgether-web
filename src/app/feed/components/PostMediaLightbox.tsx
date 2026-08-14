"use client";

import { useEffect, useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import VideoComponent from "@/components/layouts/VideoComponent/VideoComponent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface LightboxMedia {
  media_file: string;
  media_type: string;
}

interface PostMediaLightboxProps {
  medias: LightboxMedia[];
  initialIndex?: number;
  initialVideoTime?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostMediaLightbox({
  medias,
  initialIndex = 0,
  initialVideoTime = 0,
  open,
  onOpenChange,
}: PostMediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setCurrentIndex(initialIndex);
  }, [initialIndex, open]);

  const currentMedia = medias[currentIndex];
  if (!currentMedia) return null;

  const isImage = currentMedia.media_type === "image";
  const close = () => onOpenChange(false);
  const previous = () => setCurrentIndex((index) => Math.max(0, index - 1));
  const next = () =>
    setCurrentIndex((index) => Math.min(medias.length - 1, index + 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          "!fixed !inset-0 !left-0 !top-0 z-[100] flex h-dvh w-screen !max-w-none !translate-x-0 !translate-y-0 flex-col gap-0 rounded-none border-0 bg-black p-0 shadow-none",
          "data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100",
        )}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") previous();
          if (event.key === "ArrowRight") next();
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Mídia em tela cheia</DialogTitle>
        </VisuallyHidden>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-30 h-10 w-10 rounded-full bg-black/45 text-white hover:bg-black/70 hover:text-white"
          aria-label="Fechar tela cheia"
          onClick={close}
        >
          <X className="h-5 w-5" />
        </Button>

        <div
          role={isImage ? "button" : undefined}
          tabIndex={isImage ? 0 : undefined}
          aria-label={isImage ? "Fechar tela cheia" : undefined}
          className={cn(
            "relative flex min-h-0 flex-1 items-center justify-center p-2 sm:p-4",
            isImage &&
              "cursor-zoom-out [&_img]:cursor-zoom-out [&_span]:cursor-zoom-out",
          )}
          onClick={isImage ? close : undefined}
          onKeyDown={
            isImage
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    close();
                  }
                }
              : undefined
          }
        >
          {isImage ? (
            <ImageComponent
              media_id={currentMedia.media_file}
              alt="Post media fullscreen"
              delivery="master"
              objectFit="contain"
              objectPosition="center"
              className="h-full w-full cursor-zoom-out"
            />
          ) : (
            <VideoComponent
              key={currentMedia.media_file}
              media_id={currentMedia.media_file}
              delivery="master"
              className="max-h-full max-w-full cursor-default object-contain"
              controls
              autoPlay
              onLoadedMetadata={(event) => {
                if (currentIndex === initialIndex && initialVideoTime > 0) {
                  event.currentTarget.currentTime = initialVideoTime;
                }
              }}
              onClick={(event) => event.stopPropagation()}
            />
          )}

          {medias.length > 1 ? (
            <>
              {currentIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white sm:left-4"
                  aria-label="Mídia anterior"
                  onClick={(event) => {
                    event.stopPropagation();
                    previous();
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              ) : null}
              {currentIndex < medias.length - 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white sm:right-4"
                  aria-label="Próxima mídia"
                  onClick={(event) => {
                    event.stopPropagation();
                    next();
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              ) : null}
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
                {medias.map((media, index) => (
                  <span
                    key={`${media.media_file}-${index}`}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      index === currentIndex ? "bg-white" : "bg-white/50",
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

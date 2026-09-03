"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import type { ProfileMilestone } from "@/services/getProfileMilestones";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { getCloudinaryVideoUrl } from "@/app/utils/getCloudinaryVideo";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { PostMediaLightbox } from "@/app/feed/components/PostMediaLightbox";
import { cn } from "@/lib/utils";

const mediaNavButtonClassName =
  "absolute z-20 h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white";

export function MilestoneDetailModal({
  isOpen,
  onClose,
  milestone,
}: {
  isOpen: boolean;
  onClose: () => void;
  milestone: ProfileMilestone | null;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const [mediaFullscreenOpen, setMediaFullscreenOpen] = useState(false);
  const medias = milestone?.medias ?? [];
  const safeIndex = Math.min(currentIndex, Math.max(0, medias.length - 1));
  const currentMedia = medias[safeIndex];
  const hasMultiple = medias.length > 1;

  const lightboxMedias = medias.map((media) => ({
    media_file: media.public_id || media.media_url,
    media_type: media.media_type,
  }));

  useEffect(() => {
    if (isOpen) setIsMediaLoaded(false);
  }, [isOpen, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setMediaFullscreenOpen(false);
  }, [milestone?.id]);

  useEffect(() => {
    if (!isOpen) setMediaFullscreenOpen(false);
  }, [isOpen]);

  const goPrev = () => {
    setCurrentIndex((i) => (i <= 0 ? medias.length - 1 : i - 1));
  };

  const goNext = () => {
    setCurrentIndex((i) => (i >= medias.length - 1 ? 0 : i + 1));
  };

  if (!milestone) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{milestone.title}</DialogTitle>
          </DialogHeader>
          {milestone.description ? (
            <p className="text-muted-foreground text-sm -mt-2 mb-2 whitespace-pre-wrap">
              {milestone.description}
            </p>
          ) : null}
          {medias.length > 0 ? (
            <div className="relative mt-4">
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted/60 min-h-[200px] flex items-center justify-center">
                {!isMediaLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoadingComponent
                      showText={false}
                      className="h-10 w-10 text-muted-foreground"
                    />
                  </div>
                ) : null}
                {currentMedia ? (
                  currentMedia.media_type === "video" ? (
                    <video
                      src={getCloudinaryVideoUrl(currentMedia.public_id)}
                      className={cn(
                        "video-controls-no-fullscreen w-full max-h-[400px] object-contain transition-opacity duration-300",
                        isMediaLoaded ? "opacity-100" : "opacity-0",
                      )}
                      controls
                      controlsList="nofullscreen"
                      autoPlay
                      onLoadedData={() => setIsMediaLoaded(true)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="w-full cursor-zoom-in"
                      aria-label="Ver mídia em tela cheia"
                      onClick={() => setMediaFullscreenOpen(true)}
                    >
                      <img
                        src={
                          currentMedia.media_url ||
                          getCloudinaryUrl(currentMedia.public_id)
                        }
                        alt={milestone.title}
                        className={cn(
                          "w-full max-h-[400px] object-contain transition-opacity duration-300",
                          isMediaLoaded ? "opacity-100" : "opacity-0",
                        )}
                        onLoad={() => setIsMediaLoaded(true)}
                      />
                    </button>
                  )
                ) : null}

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(mediaNavButtonClassName, "right-2 top-2")}
                  aria-label="Ver mídia em tela cheia"
                  onClick={() => setMediaFullscreenOpen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>

                {hasMultiple ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        mediaNavButtonClassName,
                        "left-2 top-1/2 -translate-y-1/2",
                      )}
                      aria-label="Mídia anterior"
                      onClick={goPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        mediaNavButtonClassName,
                        "right-2 top-1/2 -translate-y-1/2",
                      )}
                      aria-label="Próxima mídia"
                      onClick={goNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                      {medias.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={cn(
                            "h-2 w-2 rounded-full transition-colors",
                            i === safeIndex ? "bg-white" : "bg-white/50",
                          )}
                          onClick={() => setCurrentIndex(i)}
                          aria-label={`Mídia ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Este marco não possui mídias.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {medias.length > 0 ? (
        <PostMediaLightbox
          medias={lightboxMedias}
          initialIndex={safeIndex}
          open={mediaFullscreenOpen}
          onOpenChange={setMediaFullscreenOpen}
        />
      ) : null}
    </>
  );
}

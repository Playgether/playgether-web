"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProfileMilestone } from "@/services/getProfileMilestones";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { getCloudinaryVideoUrl } from "@/app/utils/getCloudinaryVideo";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

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
  const medias = milestone?.medias ?? [];
  const safeIndex = Math.min(currentIndex, Math.max(0, medias.length - 1));
  const currentMedia = medias[safeIndex];
  const hasMultiple = medias.length > 1;

  useEffect(() => {
    if (isOpen) setIsMediaLoaded(false);
  }, [isOpen, currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [milestone?.id]);

  const goPrev = () => {
    setCurrentIndex((i) => (i <= 0 ? medias.length - 1 : i - 1));
  };

  const goNext = () => {
    setCurrentIndex((i) => (i >= medias.length - 1 ? 0 : i + 1));
  };

  if (!milestone) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{milestone.title}</DialogTitle>
        </DialogHeader>
        {milestone.description && (
          <p className="text-muted-foreground text-sm -mt-2 mb-2 whitespace-pre-wrap">
            {milestone.description}
          </p>
        )}
        {medias.length > 0 ? (
          <div className="relative mt-4">
            <div className="relative rounded-lg overflow-hidden border border-border bg-muted/30 min-h-[200px] flex items-center justify-center">
              {!isMediaLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingComponent
                    showText={false}
                    className="h-10 w-10 text-muted-foreground"
                  />
                </div>
              )}
              {currentMedia && (
                currentMedia.media_type === "video" ? (
                  <video
                    src={getCloudinaryVideoUrl(currentMedia.public_id)}
                    className={`w-full max-h-[400px] object-contain transition-opacity duration-300 ${isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                    controls
                    autoPlay
                    onLoadedData={() => setIsMediaLoaded(true)}
                  />
                ) : (
                  <img
                    src={
                      currentMedia.media_url ||
                      getCloudinaryUrl(currentMedia.public_id)
                    }
                    alt={milestone.title}
                    className={`w-full max-h-[400px] object-contain transition-opacity duration-300 ${isMediaLoaded ? "opacity-100" : "opacity-0"}`}
                    onLoad={() => setIsMediaLoaded(true)}
                  />
                )
              )}
            </div>
            {hasMultiple && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={goPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={goNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="flex justify-center gap-1 mt-2">
                  {medias.map((_, i) => (
                    <button
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === safeIndex ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                      onClick={() => setCurrentIndex(i)}
                      aria-label={`Mídia ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Este marco não possui mídias.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

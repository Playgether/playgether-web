"use client";

import { useState, useTransition } from "react";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Loader2, Upload, X, Clapperboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createCut } from "@/actions/getCuts";
import { Cut } from "@/types/Cut";

const MAX_DURATION = 60;
const MAX_CHARS = 2200;

interface UploadedVideo {
  public_id: string;
  secure_url: string;
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  thumbnail_url?: string;
}

interface CreateCutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (cut: Cut) => void;
}

export function CreateCutDialog({ open, onOpenChange, onCreated }: CreateCutDialogProps) {
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  function reset() {
    setVideo(null);
    setCaption("");
    setError(null);
  }

  function handleOpenChange(val: boolean) {
    if (!val) reset();
    onOpenChange(val);
  }

  function handleUpload(result: CloudinaryUploadWidgetResults) {
    if (result.event !== "success" || !result.info || typeof result.info === "string") return;
    const info = result.info as typeof result.info & {
      duration?: number;
      video?: { duration?: number };
    };
    const duration = info.duration ?? info.video?.duration;

    if (duration && duration > MAX_DURATION) {
      setError(`O vídeo pode ter no máximo ${MAX_DURATION} segundos.`);
      return;
    }

    setError(null);
    setVideo({
      public_id: info.public_id,
      secure_url: info.secure_url,
      duration,
      width: info.width,
      height: info.height,
      format: info.format,
      bytes: info.bytes,
      thumbnail_url: info.thumbnail_url,
    });
  }

  function handleSubmit() {
    if (!video) return;
    setError(null);
    startTransition(async () => {
      const cut = await createCut({
        caption: caption.trim(),
        video_file: video.public_id,
        thumbnail: video.thumbnail_url ?? "",
        duration: video.duration,
        width: video.width,
        height: video.height,
        file_format: video.format ?? "",
        bytes_file: video.bytes,
      });

      if (!cut) {
        setError("Erro ao publicar. Tente novamente.");
        return;
      }

      onCreated?.(cut);
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => { if (isWidgetOpen) e.preventDefault(); }}
        onPointerDownOutside={(e) => { if (isWidgetOpen) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clapperboard className="h-5 w-5 text-primary" />
            Novo Cut
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!video ? (
            <CldUploadWidget
              signatureEndpoint="/api/signed-cuts"
              options={{
                sources: ["local"],
                maxFiles: 1,
                maxVideoFileSize: 100_000_000,
                clientAllowedFormats: ["mp4", "mov", "webm"],
                language: "pt-br",
                showCompletedButton: true,
                multiple: false,
              }}
              onSuccess={handleUpload}
              onOpen={() => {
                setIsWidgetOpen(true);
                setTimeout(() => {
                  document.body.style.pointerEvents = "auto";
                }, 100);
              }}
              onClose={() => setIsWidgetOpen(false)}
            >
              {({ open: openWidget }) => (
                <button
                  type="button"
                  onClick={() => openWidget()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-12 transition-colors hover:border-primary/50 hover:bg-muted/50"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Clique para enviar seu vídeo</p>
                    <p className="mt-1 text-xs text-muted-foreground">MP4, MOV ou WebM · Máx. 60s · 200 MB</p>
                  </div>
                </button>
              )}
            </CldUploadWidget>
          ) : (
            <div className="relative overflow-hidden rounded-xl bg-black aspect-[9/16] max-h-64 mx-auto w-auto">
              <video
                src={video.secure_url}
                className="h-full w-full object-cover"
                muted
                loop
                autoPlay
                playsInline
              />
              <button
                type="button"
                aria-label="Remover vídeo"
                onClick={() => setVideo(null)}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
              {video.duration && (
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                  {Math.round(video.duration)}s
                </span>
              )}
            </div>
          )}

          <Textarea
            placeholder="Adicione uma legenda…"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CHARS))}
            rows={3}
            className="resize-none"
          />
          <p className="text-right text-xs text-muted-foreground">
            {caption.length}/{MAX_CHARS}
          </p>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!video || isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

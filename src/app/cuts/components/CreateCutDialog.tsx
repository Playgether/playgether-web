"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget, CloudinaryUploadWidgetResults } from "next-cloudinary";
import { Loader2, Upload, X, Clapperboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { createCut } from "@/actions/getCuts";
import { Cut } from "@/types/Cut";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import { deletePostFile } from "@/services/cloudinary_requests/deletePostFile";
import { useAuthContext } from "@/context/AuthContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import {
  BYTES_200_MB,
  CLOUDINARY_CUT_VIDEO_FORMATS,
  createVideoDurationPreBatchValidator,
  CUT_VIDEO_MAX_DURATION_SEC,
  videoExceedsMaxDuration,
} from "@/app/utils/cloudinaryUploadConfig";

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

function queueCutCleanup(publicId: string) {
  deletePostFile(publicId, "", "video").catch(console.error);
}

function restorePointerEventsAfterCloudinary() {
  if (typeof document === "undefined") return;
  document.body.style.pointerEvents = "";
  document.querySelectorAll("[data-radix-dialog-overlay]").forEach((el) => {
    const html = el as HTMLElement;
    html.style.pointerEvents = "";
    html.style.backgroundColor = "";
  });
}

export function CreateCutDialog({ open, onOpenChange, onCreated }: CreateCutDialogProps) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [video, setVideo] = useState<UploadedVideo | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const skipCleanupRef = useRef(false);
  const isWidgetOpenRef = useRef(false);
  const allowUploadClickRef = useRef(false);

  useEffect(() => {
    if (!open) {
      allowUploadClickRef.current = false;
      return;
    }
    allowUploadClickRef.current = false;
    const id = window.setTimeout(() => {
      allowUploadClickRef.current = true;
    }, 350);
    return () => window.clearTimeout(id);
  }, [open]);

  const validateCutDuration = useMemo(
    () =>
      createVideoDurationPreBatchValidator({
        maxDurationSec: CUT_VIDEO_MAX_DURATION_SEC,
        onError: (message) => setError(message),
      }),
    [],
  );

  function setWidgetOpen(next: boolean) {
    isWidgetOpenRef.current = next;
    setIsWidgetOpen(next);
  }

  function reset() {
    setVideo(null);
    setCaption("");
    setError(null);
    setWidgetOpen(false);
    restorePointerEventsAfterCloudinary();
  }

  function handleOpenChange(val: boolean, options?: { force?: boolean }) {
    // Só bloqueia clique-fora/Esc enquanto o widget do Cloudinary está aberto.
    // Publicar/Cancelar passam force para não ficar preso se o onClose do widget não disparar.
    if (!val && isWidgetOpenRef.current && !options?.force) return;
    if (!val) {
      if (video && !skipCleanupRef.current) {
        queueCutCleanup(video.public_id);
      }
      skipCleanupRef.current = false;
      reset();
    }
    onOpenChange(val);
  }

  function handleUpload(result: CloudinaryUploadWidgetResults) {
    if (result.event !== "success" || !result.info || typeof result.info === "string") return;
    const info = result.info as typeof result.info & {
      duration?: number;
      resource_type?: string;
      video?: { duration?: number };
    };
    const duration = info.duration ?? info.video?.duration;

    if (
      videoExceedsMaxDuration(
        {
          resource_type: info.resource_type || "video",
          duration,
        },
        CUT_VIDEO_MAX_DURATION_SEC,
      )
    ) {
      queueCutCleanup(info.public_id);
      setError(`O vídeo pode ter no máximo ${CUT_VIDEO_MAX_DURATION_SEC} segundos.`);
      return;
    }

    setError(null);
    setWidgetOpen(false);
    restorePointerEventsAfterCloudinary();
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

  function handleRemoveVideo() {
    if (video) queueCutCleanup(video.public_id);
    setVideo(null);
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

      skipCleanupRef.current = true;
      onCreated?.(cut);
      handleOpenChange(false, { force: true });

      CustomToast.success("Cut publicado!", {
        description: "Seu Cut já está disponível para a comunidade.",
        duration: CustomToastProps.defaultDuration,
        action: {
          label: "Ver Cut",
          onClick: () => router.push(`/cuts/${cut.id}`),
        },
      });
    });
  }

  function handleOpenUploadWidget(openWidget?: () => void, isCloudinaryLoading?: boolean) {
    if (!allowUploadClickRef.current || isCloudinaryLoading || typeof openWidget !== "function") {
      return;
    }
    try {
      openWidget();
    } catch {
      setError("Não foi possível abrir o seletor de vídeo. Tente novamente.");
    }
  }

  return (
    <>
    <CustomToaster />
    <CldUploadWidget
      signatureEndpoint="/api/signed-cuts"
      options={{
        sources: ["local"],
        maxFiles: 1,
        tags: [user?.username || "user", "cut"],
        uploadPreset: PresetsCloudinary.cuts,
        resourceType: "video",
        clientAllowedFormats: [...CLOUDINARY_CUT_VIDEO_FORMATS],
        maxVideoFileSize: BYTES_200_MB,
        preBatch: validateCutDuration,
        language: "pt-br",
        showCompletedButton: true,
        multiple: false,
      }}
      onSuccess={handleUpload}
      onOpen={() => {
        setWidgetOpen(true);
        setTimeout(() => {
          document.body.style.pointerEvents = "auto";
          document.querySelectorAll("[data-radix-dialog-overlay]").forEach((el) => {
            const html = el as HTMLElement;
            html.style.pointerEvents = "none";
            html.style.backgroundColor = "transparent";
          });
        }, 100);
      }}
      onClose={() => {
        setWidgetOpen(false);
        restorePointerEventsAfterCloudinary();
      }}
    >
      {({ open: openWidget, isLoading: isCloudinaryLoading }) => (
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
                <button
                  type="button"
                  disabled={isCloudinaryLoading}
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenUploadWidget(openWidget, isCloudinaryLoading);
                  }}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 bg-muted/30 py-12 transition-colors hover:border-primary/50 hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-60"
                >
                  {isCloudinaryLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {isCloudinaryLoading ? "Preparando envio…" : "Clique para enviar seu vídeo"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      MP4, MOV ou WebM · Máx. {CUT_VIDEO_MAX_DURATION_SEC / 60}min · 200 MB
                    </p>
                  </div>
                </button>
              ) : (
                <div
                  className="relative mx-auto max-h-64 w-auto max-w-full overflow-hidden rounded-xl bg-black"
                  style={{
                    aspectRatio:
                      video.width && video.height ? `${video.width} / ${video.height}` : "9 / 16",
                  }}
                >
                  <video
                    src={video.secure_url}
                    className="h-full w-full object-contain"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <button
                    type="button"
                    aria-label="Remover vídeo"
                    onClick={handleRemoveVideo}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {video.duration ? (
                    <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                      {Math.round(video.duration)}s
                    </span>
                  ) : null}
                </div>
              )}

              <MentionTextarea
                placeholder="Adicione uma legenda…"
                value={caption}
                onChange={(next) => setCaption(next.slice(0, MAX_CHARS))}
                rows={3}
                className="resize-none"
              />
              <p className="text-right text-xs text-muted-foreground">
                {caption.length}/{MAX_CHARS}
              </p>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => handleOpenChange(false, { force: true })} disabled={isPending}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!video || isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </CldUploadWidget>
    </>
  );
}

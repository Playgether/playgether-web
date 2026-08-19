"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImagePlay, X, Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CldUploadWidget } from "next-cloudinary";

import { useCreatePostContext } from "@/context/CreatePostContext";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import {
  CustomToastErrorMessages,
  CustomToastProps,
} from "@/error/custom-toaster/enum";
import { deletePostFile } from "@/services/cloudinary_requests/deletePostFile";
import { createPost, PostMediaProps } from "@/actions/createPost";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import {
  BYTES_5_MB,
  BYTES_50_MB,
  CLOUDINARY_IMAGE_AND_VIDEO_FORMATS,
  createVideoDurationPreBatchValidator,
  POST_VIDEO_MAX_DURATION_SEC,
  videoExceedsMaxDuration,
} from "@/app/utils/cloudinaryUploadConfig";

export const CreatePostModal = () => {
  const [content, setContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<PostMediaProps[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const validatePostVideoDuration = useMemo(
    () =>
      createVideoDurationPreBatchValidator({
        maxDurationSec: POST_VIDEO_MAX_DURATION_SEC,
        onError: (message) => {
          CustomToast.error("Vídeo inválido", {
            description: message,
            duration: CustomToastProps.defaultDuration,
          });
        },
      }),
    [],
  );
  const createPostContext = useCreatePostContext();
  const { user } = useAuthContext();
  const { profile } = useProfileContext();

  const displayName = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "";
  const initials = user ? (user.first_name?.[0] ?? user.username?.[0] ?? "?").toUpperCase() : "?";

  const handleCreatePostModal = createPostContext?.handleCreatePostModal ?? (() => {});
  const createPostOpen = createPostContext?.createPostOpen ?? false;

  // Sincronizar o estado local com o contexto
  useEffect(() => {
    setModalOpen(createPostOpen);
  }, [createPostOpen]);

  const getCurrentDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const handleUploadSuccess = async (result: any) => {
    const info = result?.info;
    if (!info || typeof info !== "object" || !info.public_id) {
      return;
    }

    if (videoExceedsMaxDuration(info, POST_VIDEO_MAX_DURATION_SEC)) {
      deletePostFile(info.public_id, "", "video").catch(console.error);
      CustomToast.error("Vídeo muito longo", {
        description: `Vídeos devem ter no máximo ${POST_VIDEO_MAX_DURATION_SEC} segundos.`,
        duration: CustomToastProps.defaultDuration,
      });
      return;
    }

    setUploadedFiles((prevFiles) => [
      ...prevFiles,
      {
        url: info.secure_url,
        media_file: info.public_id,
        media_type: info.resource_type,
        width: info.width,
        height: info.height,
        bytes_file: info.bytes,
        file_format: info.format,
        created_at: info.created_at,
        media_folder: info.asset_folder,
      },
    ]);
  };

  const handleUploadError = (error: any) => {
    CustomToast.error("Erro no upload", {
      description:
        error.statusText || "Um dos seus uploads não cumpre as diretrizes",
      duration: CustomToastProps.defaultDuration,
    });
    setWidgetKey((prevCount) => prevCount + 1);

    // Evita mídia órfã no Cloudinary se o lote falhar no meio
    setUploadedFiles((prev) => {
      for (const media of prev) {
        if (!media.media_file) continue;
        deletePostFile(
          media.media_file,
          media.media_folder,
          media.media_type,
        ).catch((err) => console.error("Erro ao deletar mídia:", err));
      }
      return [];
    });
  };

  const removeMedia = (index: number) => {
    const mediaToRemove = uploadedFiles[index];

    deletePostFile(
      mediaToRemove.media_file,
      mediaToRemove.media_folder,
      mediaToRemove.media_type,
    ).catch((error) => {
      console.error("Erro ao deletar mídia:", error);
    });

    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const queueMediaCleanup = async (medias: typeof uploadedFiles) => {
    await Promise.allSettled(
      medias
        .filter((media) => Boolean(media.media_file))
        .map((media) =>
          deletePostFile(
            media.media_file,
            media.media_folder,
            media.media_type,
          ),
        ),
    );
  };

  const handleSubmit = async () => {
    if (!content.trim() && uploadedFiles.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const validMedias = uploadedFiles.filter((m) => Boolean(m.media_file));
      const response = await createPost({
        comment: content.trim(),
        has_post_media: validMedias.length > 0,
        medias: validMedias,
      });

      if (response.status === 201) {
        window.dispatchEvent(
          new CustomEvent("post-created", { detail: response.data })
        );

        CustomToast.success("Post criado com sucesso!", {
          duration: CustomToastProps.defaultDuration,
        });

        setContent("");
        setUploadedFiles([]);
        handleCreatePostModal(false);
      } else {
        const apiError =
          typeof response.error === "string"
            ? response.error
            : response.error?.detail ||
              response.error?.comment?.[0] ||
              CustomToastErrorMessages.postErrorMessage;
        throw new Error(
          typeof apiError === "string" ? apiError : JSON.stringify(apiError)
        );
      }
    } catch (error) {
      if (uploadedFiles.length > 0) {
        await queueMediaCleanup(uploadedFiles);
        setUploadedFiles([]);
      }

      CustomToast.error(CustomToastErrorMessages.defaultTitle, {
        description:
          error instanceof Error
            ? error.message
            : CustomToastErrorMessages.postErrorMessage,
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = async (open: boolean) => {
    // Se o widget estiver aberto, não permite fechar o modal
    if (isWidgetOpen) {
      return;
    }

    if (!open && uploadedFiles.length > 0) {
      await queueMediaCleanup(uploadedFiles);
      setUploadedFiles([]);
    }

    if (!open) {
      setContent("");
      setUploadedFiles([]);
      setIsSubmitting(false);
    }

    setModalOpen(open);
    handleCreatePostModal(open);
  };

  // Manipuladores específicos para o Cloudinary Widget
  const handleWidgetOpen = () => {
    setIsWidgetOpen(true);
    // Pequeno atraso para garantir que o widget abra corretamente
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
    }, 100);
  };

  const handleWidgetClose = () => {
    setIsWidgetOpen(false);
  };

  return (
    <>
      <CustomToaster />

      <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
        <DialogContent
          className="flex max-h-[min(90dvh,calc(100dvh-var(--layout-header-height)-2rem))] max-w-2xl flex-col overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50"
          // Previne que o modal feche quando o widget estiver aberto
          onInteractOutside={(e) => {
            if (isWidgetOpen) {
              e.preventDefault();
            }
          }}
          // Permite interagir com o widget
          onPointerDownOutside={(e) => {
            if (isWidgetOpen) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Criar Post
            </DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-0.5 py-1 pr-1">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                <AvatarImage
                  src={profile?.profile_photo ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{displayName}</h3>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
              </div>
            </div>

            {/* Content Input */}
            <MentionTextarea
              placeholder="O que está acontecendo?"
              value={content}
              onChange={setContent}
              className="min-h-32 resize-none border-border/50 bg-muted/60 focus:border-primary/50 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/50 focus-visible:ring-offset-0"
            />

            {/* Media Preview */}
            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {uploadedFiles.map((file, index) => (
                  <Card key={index} className="relative overflow-hidden">
                    <div className="relative aspect-square">
                      {file.media_type === "video" ? (
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={file.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 w-8 h-8"
                        onClick={() => removeMedia(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center justify-between border-t border-border/50 pt-4">
              <div className="flex space-x-2">
                <CldUploadWidget
                  key={`media-${widgetKey}`}
                  signatureEndpoint="/api/signed-posts"
                  options={{
                    sources: ["local"],
                    maxFiles: 5 - uploadedFiles.length,
                    tags: [
                      user?.username || "user",
                      getCurrentDate(),
                      "post",
                      "user",
                    ],
                    uploadPreset: PresetsCloudinary.posts,
                    resourceType: "auto",
                    clientAllowedFormats: [
                      ...CLOUDINARY_IMAGE_AND_VIDEO_FORMATS,
                    ],
                    maxImageFileSize: BYTES_5_MB,
                    maxVideoFileSize: BYTES_50_MB,
                    preBatch: validatePostVideoDuration,
                    language: "pt-br",
                    showCompletedButton: true,
                    multiple: true,
                  }}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  onOpen={handleWidgetOpen}
                  onClose={handleWidgetClose}
                >
                  {({ open }) => (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => {
                        if (uploadedFiles.length >= 5) {
                          CustomToast.warning("Limite de mídias", {
                            description:
                              "Você pode adicionar no máximo 5 mídias por post.",
                            duration: CustomToastProps.defaultDuration,
                          });
                          return;
                        }
                        open();
                      }}
                      disabled={uploadedFiles.length >= 5}
                      aria-label="Adicionar fotos ou vídeos"
                    >
                      <ImagePlay className="w-5 h-5" />
                    </Button>
                  )}
                </CldUploadWidget>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={
                  (!content.trim() && uploadedFiles.length === 0) ||
                  isSubmitting
                }
                className="bg-gradient-primary hover:opacity-90 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Postando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Postar
                  </>
                )}
              </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

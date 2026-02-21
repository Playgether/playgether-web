"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Video, X, Send, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CldUploadWidget } from "next-cloudinary";

// Import current user avatar
import avatarRaymond from "@/assets/avatar-raymond.jpg";
import { useFeedContext } from "../context/FeedContext";
import { useAuthContext } from "@/context/AuthContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import {
  CustomToastErrorMessages,
  CustomToastProps,
} from "@/error/custom-toaster/enum";
import { deletePostFile } from "@/services/cloudinary_requests/deletePostFile";
import { createPost, PostMediaProps } from "@/actions/createPost";

const currentUser = {
  name: "Raymond Junior",
  username: "raymond",
  avatar: avatarRaymond,
};

export const CreatePostModal = () => {
  const [content, setContent] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<PostMediaProps[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const { handlePostCreated, handleCreatePostModal, createPostOpen } =
    useFeedContext();
  const { user } = useAuthContext();

  const getCurrentDate = () => {
    const date = new Date();
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
  };

  const handleUploadSuccess = async (result: any) => {
    setUploadedFiles((prevFiles) => [
      ...prevFiles,
      {
        url: result.info.secure_url,
        media_file: result.info.public_id,
        media_type: result.info.resource_type,
        width: result.info.width,
        height: result.info.height,
        bytes_file: result.info.bytes,
        file_format: result.info.format,
        created_at: result.info.created_at,
        media_folder: result.info.asset_folder,
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

  const handleSubmit = async () => {
    if (!content.trim() && uploadedFiles.length === 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await createPost({
        comment: content,
        has_post_media: uploadedFiles.length > 0,
        medias: uploadedFiles,
      });

      if (response.status === 201) {
        handlePostCreated(response.data);

        CustomToast.success("Post criado com sucesso!", {
          duration: CustomToastProps.defaultDuration,
        });

        setContent("");
        setUploadedFiles([]);
        handleCreatePostModal(false);
      } else {
        throw new Error("Failed to create post");
      }
    } catch (error) {
      if (uploadedFiles.length > 0) {
        for (const media of uploadedFiles) {
          await deletePostFile(
            media.media_file,
            media.media_folder,
            media.media_type,
          );
        }
        setUploadedFiles([]);
      }

      CustomToast.error(CustomToastErrorMessages.defaultTitle, {
        description: CustomToastErrorMessages.postErrorMessage,
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = async (open: boolean) => {
    // Não fechar o modal se o widget do Cloudinary estiver aberto
    if (!open && isWidgetOpen) {
      return;
    }

    if (!open && uploadedFiles.length > 0) {
      for (const media of uploadedFiles) {
        await deletePostFile(
          media.media_file,
          media.media_folder,
          media.media_type,
        );
      }
      setUploadedFiles([]);
    }

    if (!open) {
      setContent("");
      setUploadedFiles([]);
      setIsSubmitting(false);
    }

    handleCreatePostModal(open);
  };

  return (
    <>
      <CustomToaster />

      <Dialog
        open={createPostOpen}
        onOpenChange={handleCloseModal}
        modal={!isWidgetOpen}
      >
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Criar Post
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                <AvatarImage
                  src={currentUser.avatar.src}
                  alt={currentUser.name}
                />
                <AvatarFallback className="bg-gradient-primary text-white">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">
                  {currentUser.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{currentUser.username}
                </p>
              </div>
            </div>

            {/* Content Input */}
            <Textarea
              placeholder="O que está acontecendo?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-32 resize-none bg-muted/30 border-border/50 focus:border-primary/50"
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

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex space-x-2">
                <CldUploadWidget
                  key={`image-${widgetKey}`}
                  signatureEndpoint="/api/signed-posts"
                  options={{
                    sources: ["local"],
                    minImageHeight: 320,
                    minImageWidth: 320,
                    // maxImageHeight: 1080,
                    // maxImageWidth: 1980,
                    maxFiles: 5 - uploadedFiles.length,
                    tags: [
                      user?.username || "user",
                      getCurrentDate(),
                      "post",
                      "user",
                    ],
                    detection: "unidet",
                    maxImageFileSize: 5000000,
                    validateMaxWidthHeight: true,
                    language: "pt-br",
                    showCompletedButton: true,
                    multiple: true,
                    clientAllowedFormats: ["image"],
                  }}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  onOpen={() => setIsWidgetOpen(true)}
                  onClose={() => setIsWidgetOpen(false)}
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
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                  )}
                </CldUploadWidget>

                <CldUploadWidget
                  key={`video-${widgetKey}`}
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
                    detection: "unidet",
                    maxVideoFileSize: 50000000,
                    language: "pt-br",
                    showCompletedButton: true,
                    multiple: true,
                    clientAllowedFormats: ["video"],
                  }}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  onOpen={() => setIsWidgetOpen(true)}
                  onClose={() => setIsWidgetOpen(false)}
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
                    >
                      <Video className="w-5 h-5" />
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

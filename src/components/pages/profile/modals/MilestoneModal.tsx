"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import { deletePostFile } from "@/services/cloudinary_requests/deletePostFile";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import type { MilestoneMediaInput } from "@/actions/milestones";
import type { ProfileMilestone, ProfileMilestoneMedia } from "@/services/getProfileMilestones";

interface MilestoneFormData {
  title: string;
  description: string;
  date: string;
  medias: MilestoneMediaInput[];
}

export function MilestoneModal({
  isOpen,
  onClose,
  onSubmit,
  milestone,
  mode,
  profileId,
  isSubmitting = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MilestoneFormData) => Promise<void>;
  milestone: ProfileMilestone | null;
  mode: "add" | "edit";
  profileId: number;
  isSubmitting?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<MilestoneMediaInput[]>([]);
  const [widgetKey, setWidgetKey] = useState(0);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const handleWidgetOpen = () => {
    setIsWidgetOpen(true);
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
    }, 100);
  };

  const handleWidgetClose = () => {
    setIsWidgetOpen(false);
  };

  const maxDate = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  useEffect(() => {
    if (isOpen) {
      setTitle(milestone?.title ?? "");
      setDescription(milestone?.description ?? "");
      setDate(milestone?.date ?? "");
      setUploadedFiles(
        (milestone?.medias ?? []).map((m: ProfileMilestoneMedia) => ({
          media_url: m.media_url,
          media_type: m.media_type,
          public_id: m.public_id,
        }))
      );
    }
  }, [isOpen, milestone]);

  const handleUploadSuccess = (result: any) => {
    setUploadedFiles((prev) => {
      if (prev.length >= 3) return prev;
      return [
        ...prev,
        {
          media_url: result.info.secure_url,
          media_type: result.info.resource_type === "video" ? "video" : "image",
          public_id: result.info.public_id,
        },
      ];
    });
  };

  const handleUploadError = (error: any) => {
    CustomToast.error("Erro no upload", {
      description: error?.statusText || "Falha ao enviar mídia",
      duration: CustomToastProps.defaultDuration,
    });
    setWidgetKey((prev) => prev + 1);
  };

  const removeMedia = (index: number) => {
    const media = uploadedFiles[index];
    deletePostFile(media.public_id, "", media.media_type).catch(console.error);
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      CustomToast.error("Título obrigatório", {
        duration: CustomToastProps.defaultDuration,
      });
      return;
    }
    if (!date.trim()) {
      CustomToast.error("Data obrigatória", {
        duration: CustomToastProps.defaultDuration,
      });
      return;
    }
    await onSubmit({ title: title.trim(), description: description.trim() || "", date, medias: uploadedFiles });
    setTitle("");
    setDescription("");
    setDate("");
    setUploadedFiles([]);
    onClose();
  };

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      if (mode === "add" && uploadedFiles.length > 0) {
        uploadedFiles.forEach((m) => {
          deletePostFile(m.public_id, "", m.media_type).catch(console.error);
        });
        setUploadedFiles([]);
      }
      onClose();
    }
  };

  return (
    <>
      <CustomToaster />
      <div style={{ pointerEvents: isWidgetOpen ? "none" : "auto" }}>
        <Dialog open={isOpen} onOpenChange={handleCloseModal}>
          <DialogContent
            className="max-w-lg"
            onInteractOutside={(e) => {
              if (isWidgetOpen) e.preventDefault();
            }}
            onPointerDownOutside={(e) => {
              if (isWidgetOpen) e.preventDefault();
            }}
          >
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Adicionar Marco" : "Editar Marco"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do marco (até 3 mídias).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título"
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">
                {title.length}/255
              </p>
            </div>
            <div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição"
                maxLength={500}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">
                {description.length}/500
              </p>
            </div>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="Data"
              max={maxDate}
            />
            <div>
              <p className="text-sm font-medium mb-2">Mídias (máx. 3)</p>
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} className="relative overflow-hidden">
                      <div className="relative aspect-square">
                        {file.media_type === "video" ? (
                          <video
                            src={file.media_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        ) : (
                          <img
                            src={file.media_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-7 h-7"
                          onClick={() => removeMedia(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              {uploadedFiles.length < 3 && (
                <CldUploadWidget
                  key={`milestone-${widgetKey}`}
                  signatureEndpoint="/api/signed-milestones"
                  uploadPreset={PresetsCloudinary.profile_milestones}
                  options={{
                    detection: "unidet",
                    sources: ["local"],
                    maxFiles: 3 - uploadedFiles.length,
                    multiple: true,
                    clientAllowedFormats: ["image", "video"],
                    maxImageFileSize: 5000000,
                    maxVideoFileSize: 50000000,
                    language: "pt-br",
                    showCompletedButton: true,
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
                        if (uploadedFiles.length >= 3) return;
                        open();
                      }}
                      disabled={uploadedFiles.length >= 3}
                    >
                      <ImagePlus className="w-5 h-5" />
                    </Button>
                  )}
                </CldUploadWidget>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !date.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}

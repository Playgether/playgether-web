"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2, Image, Trash2, ImagePlus } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import NoImageProfile from "@/components/general/NoImageProfile";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import { patchProfile } from "@/services/patchProfile";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { useAuthContext } from "@/context/AuthContext";
import axios from "axios";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: getProfileByUsernameProps | null;
  onProfileUpdated: (updated: Partial<getProfileByUsernameProps>) => void;
  onWidgetOpenChange?: (open: boolean) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onWidgetOpenChange,
}: ProfileEditModalProps) {
  const { user } = useAuthContext();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newProfilePhoto, setNewProfilePhoto] = useState<string | null>(null);
  const [removePhotoRequested, setRemovePhotoRequested] = useState(false);
  const [oldProfilePhotoPublicId, setOldProfilePhotoPublicId] = useState<
    string | null
  >(null);
  const [newProfileBanner, setNewProfileBanner] = useState<string | null>(null);
  const [removeBannerRequested, setRemoveBannerRequested] = useState(false);
  const [oldProfileBannerPublicId, setOldProfileBannerPublicId] = useState<
    string | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [widgetKey, setWidgetKey] = useState(0);
  const [widgetKeyBanner, setWidgetKeyBanner] = useState(0);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  useEffect(() => {
    if (profile && isOpen) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
      setNewProfilePhoto(null);
      setRemovePhotoRequested(false);
      setOldProfilePhotoPublicId(profile.profile_photo ?? null);
      setNewProfileBanner(null);
      setRemoveBannerRequested(false);
      setOldProfileBannerPublicId(profile.profile_banner ?? null);
    }
  }, [profile, isOpen]);

  const deleteOldProfileImage = async (publicId: string) => {
    try {
      await axios.post("/api/signed-delete-posts/", {
        public_id: publicId,
        resource_type: "image",
      });
    } catch (err) {
      console.error("Erro ao excluir imagem antiga:", err);
    }
  };

  const handleUploadSuccess = async (result: any) => {
    const publicId = result?.info?.public_id;
    if (!publicId || !profile) return;
    setNewProfilePhoto(publicId);
    setRemovePhotoRequested(false);

    try {
      await patchProfile(profile.username ?? profile.id, {
        profile_photo: publicId,
      });
      if (oldProfilePhotoPublicId) {
        await deleteOldProfileImage(oldProfilePhotoPublicId);
      }
      onProfileUpdated({ profile_photo: publicId });
      setOldProfilePhotoPublicId(publicId);
      CustomToast.success("Foto de perfil atualizada!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      try {
        await axios.post("/api/signed-delete-posts/", {
          public_id: publicId,
          resource_type: "image",
        });
      } catch (delErr) {
        console.error("Erro ao remover mídia órfã:", delErr);
      }
      setNewProfilePhoto(null);
      CustomToast.error("Erro ao salvar foto", {
        description: err?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    }
  };

  const handleWidgetOpen = () => {
    setIsWidgetOpen(true);
    onWidgetOpenChange?.(true);
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
      document.querySelectorAll("[data-radix-dialog-overlay]").forEach((el) => {
        const html = el as HTMLElement;
        html.style.pointerEvents = "none";
        html.style.backgroundColor = "transparent";
      });
    }, 100);
  };

  const handleWidgetClose = () => {
    setIsWidgetOpen(false);
    onWidgetOpenChange?.(false);
    document.body.style.pointerEvents = "";
    document.querySelectorAll("[data-radix-dialog-overlay]").forEach((el) => {
      const html = el as HTMLElement;
      html.style.pointerEvents = "";
      html.style.backgroundColor = "";
    });
  };

  const handleUploadError = () => {
    CustomToast.error("Erro no upload", {
      description: "Não foi possível enviar a foto. Tente novamente.",
      duration: CustomToastProps.defaultDuration,
    });
    setWidgetKey((k) => k + 1);
  };

  const handleRemovePhoto = async () => {
    if (!profile || !oldProfilePhotoPublicId) return;
    setRemovePhotoRequested(true);
    setNewProfilePhoto(null);
    try {
      await patchProfile(profile.username ?? profile.id, {
        profile_photo: null,
      });
      await deleteOldProfileImage(oldProfilePhotoPublicId);
      onProfileUpdated({ profile_photo: undefined });
      setOldProfilePhotoPublicId(null);
      CustomToast.success("Foto de perfil removida!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      CustomToast.error("Erro ao remover foto", {
        description: err?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
      setRemovePhotoRequested(false);
    }
  };

  const handleBannerUploadSuccess = async (result: any) => {
    const publicId = result?.info?.public_id;
    if (!publicId || !profile) return;
    const oldBannerId = oldProfileBannerPublicId;
    setNewProfileBanner(publicId);
    setRemoveBannerRequested(false);
    try {
      await patchProfile(profile.username ?? profile.id, {
        profile_banner: publicId,
      });
      if (oldBannerId) {
        await deleteOldProfileImage(oldBannerId);
      }
      onProfileUpdated({ profile_banner: publicId });
      setOldProfileBannerPublicId(publicId);
      CustomToast.success("Banner atualizado!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      try {
        await axios.post("/api/signed-delete-posts/", {
          public_id: publicId,
          resource_type: "image",
        });
      } catch (delErr) {
        console.error("Erro ao remover mídia órfã:", delErr);
      }
      setNewProfileBanner(null);
      CustomToast.error("Erro ao salvar banner", {
        description: err?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    }
  };

  const handleBannerUploadError = () => {
    CustomToast.error("Erro no upload", {
      description: "Não foi possível enviar o banner. Tente novamente.",
      duration: CustomToastProps.defaultDuration,
    });
    setWidgetKeyBanner((k) => k + 1);
  };

  const handleRemoveBanner = async () => {
    if (!profile) return;
    const oldBannerId = oldProfileBannerPublicId;
    setRemoveBannerRequested(true);
    setNewProfileBanner(null);
    try {
      await patchProfile(profile.username ?? profile.id, {
        profile_banner: null,
      });
      if (oldBannerId) {
        await deleteOldProfileImage(oldBannerId);
      }
      onProfileUpdated({ profile_banner: undefined });
      setOldProfileBannerPublicId(null);
      CustomToast.success("Banner removido!", {
        duration: CustomToastProps.defaultDuration,
      });
    } catch (err: any) {
      CustomToast.error("Erro ao remover banner", {
        description: err?.message ?? "Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
      setRemoveBannerRequested(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSubmitting(true);

    try {
      const payload: {
        name?: string;
        bio?: string;
        profile_photo?: string | null;
      } = {};

      if (name.trim()) payload.name = name.trim();
      if (bio !== (profile.bio ?? "")) payload.bio = bio;
      if (removePhotoRequested) payload.profile_photo = null;
      else if (newProfilePhoto) payload.profile_photo = newProfilePhoto;

      if (Object.keys(payload).length === 0) {
        onClose();
        setIsSubmitting(false);
        return;
      }

      await patchProfile(profile.username ?? profile.id, payload);

      if (oldProfilePhotoPublicId && (newProfilePhoto || removePhotoRequested)) {
        await deleteOldProfileImage(oldProfilePhotoPublicId);
      }

      onProfileUpdated({
        name: payload.name ?? profile.name,
        bio: payload.bio ?? profile.bio,
        profile_photo: removePhotoRequested ? undefined : (payload.profile_photo ?? profile.profile_photo),
      });

      CustomToast.success("Perfil atualizado com sucesso!", {
        duration: CustomToastProps.defaultDuration,
      });
      onClose();
    } catch (error: any) {
      CustomToast.error("Erro ao atualizar perfil", {
        description:
          error?.message ?? "Ocorreu um erro. Tente novamente.",
        duration: CustomToastProps.defaultDuration,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayPhoto =
    removePhotoRequested ? null : (newProfilePhoto ?? profile?.profile_photo);
  const hasCurrentPhoto = !!(
    (profile?.profile_photo || newProfilePhoto) &&
    !removePhotoRequested
  );
  const displayBanner =
    removeBannerRequested ? null : (newProfileBanner ?? profile?.profile_banner);
  const hasCurrentBanner = !!(
    (profile?.profile_banner || newProfileBanner) &&
    !removeBannerRequested
  );

  return (
    <>
      <CustomToaster />
      <Dialog open={isOpen} onOpenChange={(open) => !open && !isWidgetOpen && onClose()}>
        <DialogContent
          className="max-w-md bg-background/95 backdrop-blur-xl border border-border/50 z-[100]"
          onInteractOutside={(e) => isWidgetOpen && e.preventDefault()}
          onPointerDownOutside={(e) => isWidgetOpen && e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium w-full">Banner</label>
              <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden ring-2 ring-primary/30 bg-muted">
                {displayBanner ? (
                  <ImageComponent
                    media_id={displayBanner}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/50">
                    <span className="text-muted-foreground text-sm">
                      Nenhum banner
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full justify-center">
                <CldUploadWidget
                  key={widgetKeyBanner}
                  signatureEndpoint="/api/signed-profile-banner"
                  options={{
                    uploadPreset: PresetsCloudinary.profile_banners,
                    multiple: false,
                    tags: [user?.username ?? "user", "profile", "banner"],
                    singleUploadAutoClose: true,
                    cropping: true,
                    croppingAspectRatio: 3,
                    language: "pt-br",
                    clientAllowedFormats: ["image"],
                  }}
                  onSuccess={handleBannerUploadSuccess}
                  onError={handleBannerUploadError}
                  onOpen={handleWidgetOpen}
                  onClose={handleWidgetClose}
                >
                  {({ open, isLoading }) => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => {
                        if (typeof open === "function") open();
                      }}
                    >
                      <ImagePlus className="w-4 h-4 mr-2" />
                      Alterar banner
                    </Button>
                  )}
                </CldUploadWidget>
                {hasCurrentBanner && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemoveBanner}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover banner
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium w-full">Foto de perfil</label>
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/30 shrink-0">
                {displayPhoto ? (
                  <ImageComponent
                    media_id={displayPhoto}
                    className="object-cover w-full h-full rounded-full"
                  />
                ) : (
                  <NoImageProfile
                    className="w-24 h-24"
                    iconClassName="w-12 h-12"
                  />
                )}
              </div>
              <div className="flex gap-2 justify-center">
                <CldUploadWidget
                  key={widgetKey}
                  signatureEndpoint="/api/signed-profile"
                  options={{
                    uploadPreset: PresetsCloudinary.profile_image,
                    multiple: false,
                    tags: [user?.username ?? "user", "profile", "image", "user"],
                    singleUploadAutoClose: true,
                    cropping: true,
                    croppingAspectRatio: 1,
                    language: "pt-br",
                    clientAllowedFormats: ["image"],
                  }}
                  onSuccess={handleUploadSuccess}
                  onError={handleUploadError}
                  onOpen={handleWidgetOpen}
                  onClose={handleWidgetClose}
                >
                  {({ open, isLoading }) => (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => {
                        if (typeof open === "function") open();
                      }}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      Alterar foto
                    </Button>
                  )}
                </CldUploadWidget>
                {hasCurrentPhoto && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleRemovePhoto}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover foto
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <div className="flex gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditingName}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingName(!isEditingName)}
                  title={isEditingName ? "Desabilitar edição" : "Editar"}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <div className="flex gap-2">
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={!isEditingBio}
                  rows={4}
                  className="flex-1 resize-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditingBio(!isEditingBio)}
                  title={isEditingBio ? "Desabilitar edição" : "Editar"}
                  className="self-start"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="bg-gradient-primary hover:opacity-90"
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

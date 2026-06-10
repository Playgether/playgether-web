"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Trash2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { patchProfile, PROFILE_BIO_MAX_LENGTH } from "@/services/patchProfile";
import { useProfileContext } from "@/context/ProfileContext";
import { useAuthContext } from "@/context/AuthContext";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";

export default function AccountSettingsPage() {
  const { profile, fetchProfile } = useProfileContext();
  const { user } = useAuthContext();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile === undefined) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await patchProfile(profile.id, {
        name,
        bio,
        ...(removePhoto ? { profile_photo: null } : newPhoto ? { profile_photo: newPhoto } : {}),
        ...(removeBanner ? { profile_banner: null } : newBanner ? { profile_banner: newBanner } : {}),
      });
      await fetchProfile();
      setNewPhoto(null);
      setNewBanner(null);
      setRemovePhoto(false);
      setRemoveBanner(false);
      CustomToast.success("Perfil atualizado com sucesso!");
    } catch (err: any) {
      CustomToast.error(err?.message ?? "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const currentPhoto = removePhoto ? null : (newPhoto ?? profile?.profile_photo ?? null);
  const currentBanner = removeBanner ? null : (newBanner ?? profile?.profile_banner ?? null);
  const bannerSrc = currentBanner ? resolveGameMediaUrl(currentBanner) : null;

  if (loading) {
    return (
      <SettingsPageWrapper title="Conta">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </SettingsPageWrapper>
    );
  }

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Conta"
        description="Gerencie suas informações pessoais e aparência do perfil."
      >
        {/* Avatar & Banner */}
        <SettingsSection title="Foto & Banner">
          {/* Banner */}
          <div className="relative h-36 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center border border-border/50">
            {bannerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <p className="text-xs text-muted-foreground">Sem banner</p>
            )}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <CldUploadWidget
                uploadPreset={PresetsCloudinary.profile_banners}
                onSuccess={(result: any) => {
                  setNewBanner(result?.info?.public_id ?? null);
                  setRemoveBanner(false);
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 px-3 text-xs rounded-lg"
                    onClick={() => open()}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    Alterar
                  </Button>
                )}
              </CldUploadWidget>
              {(currentBanner) && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 px-3 text-xs rounded-lg"
                  onClick={() => {
                    setRemoveBanner(true);
                    setNewBanner(null);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20">
            <ProfileAvatar
              displayName={name || user?.username || ""}
              username={user?.username}
              profilePhoto={currentPhoto}
              sizeClass="h-16 w-16"
            />
            <div className="flex gap-2">
              <CldUploadWidget
                uploadPreset={PresetsCloudinary.profile_image}
                onSuccess={(result: any) => {
                  setNewPhoto(result?.info?.public_id ?? null);
                  setRemovePhoto(false);
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs rounded-lg"
                    onClick={() => open()}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1" />
                    Alterar foto
                  </Button>
                )}
              </CldUploadWidget>
              {currentPhoto && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-3 text-xs rounded-lg text-destructive hover:text-destructive"
                  onClick={() => {
                    setRemovePhoto(true);
                    setNewPhoto(null);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Remover
                </Button>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Profile Info */}
        <SettingsSection title="Informações do perfil">
          <div className="space-y-4 p-4 rounded-xl bg-muted/20">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nome de exibição</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-background/50 border-border/50"
                maxLength={60}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Username</Label>
              <Input
                value={user?.username ?? ""}
                readOnly
                disabled
                className="bg-muted/30 border-border/30 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                O username não pode ser alterado por aqui no momento.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">E-mail</Label>
              <Input
                value=""
                readOnly
                disabled
                placeholder="email@exemplo.com"
                className="bg-muted/30 border-border/30 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                Altere o e-mail na seção de Segurança.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Bio</Label>
                <span className="text-xs text-muted-foreground">
                  {bio.length}/{PROFILE_BIO_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte algo sobre você..."
                rows={3}
                maxLength={PROFILE_BIO_MAX_LENGTH}
                className="bg-background/50 border-border/50 resize-none"
              />
            </div>
          </div>
        </SettingsSection>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 px-8"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </SettingsPageWrapper>
    </>
  );
}

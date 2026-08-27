"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Trash2, Mail, Eye, EyeOff, Lock, AtSign, Clock, AlertTriangle } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { patchProfile, PROFILE_BIO_MAX_LENGTH } from "@/services/patchProfile";
import { useProfileContext } from "@/context/ProfileContext";
import { useAuthContext } from "@/context/AuthContext";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import { PresetsCloudinary } from "@/components/content_types/PresetsCloudinary";
import { deleteCloudinaryImage } from "@/services/cloudinary_requests/deletePostFile";
import {
  BYTES_8_MB,
  CLOUDINARY_IMAGE_FORMATS,
} from "@/app/utils/cloudinaryUploadConfig";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TwoFAVerifyModal } from "@/components/ui/TwoFAVerifyModal";
import { deleteAccount } from "@/services/deleteAccount";
import type { MeResponse } from "@/app/api/users/me/route";

export default function AccountSettingsPage() {
  const { profile, fetchProfile } = useProfileContext();
  const { user, logout } = useAuthContext();

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newBanner, setNewBanner] = useState<string | null>(null);
  const pendingPhotoRef = useRef<string | null>(null);
  const pendingBannerRef = useRef<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState<MeResponse | null>(null);

  // Email modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  // Username modal
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // 2FA gates for each sensitive action
  const [emailNeedsTotp, setEmailNeedsTotp] = useState(false);
  const [usernameNeedsTotp, setUsernameNeedsTotp] = useState(false);

  // Delete account flow
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteNeedsTotp, setDeleteNeedsTotp] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (profile === undefined) await fetchProfile();
        const meRes = await fetch("/api/users/me/", { credentials: "include" });
        if (meRes.ok) setMe(await meRes.json());
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      if (pendingPhotoRef.current) {
        void deleteCloudinaryImage(pendingPhotoRef.current);
      }
      if (pendingBannerRef.current) {
        void deleteCloudinaryImage(pendingBannerRef.current);
      }
    };
  }, []);

  const refreshMe = async () => {
    const res = await fetch("/api/users/me/", { credentials: "include" });
    if (res.ok) setMe(await res.json());
  };

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
      pendingPhotoRef.current = null;
      pendingBannerRef.current = null;
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

  const handlePendingPhoto = (publicId: string) => {
    const previous = pendingPhotoRef.current;
    pendingPhotoRef.current = publicId;
    setNewPhoto(publicId);
    setRemovePhoto(false);
    if (previous && previous !== publicId) {
      void deleteCloudinaryImage(previous);
    }
  };

  const handlePendingBanner = (publicId: string) => {
    const previous = pendingBannerRef.current;
    pendingBannerRef.current = publicId;
    setNewBanner(publicId);
    setRemoveBanner(false);
    if (previous && previous !== publicId) {
      void deleteCloudinaryImage(previous);
    }
  };

  const handleRemovePendingPhoto = () => {
    if (pendingPhotoRef.current) {
      void deleteCloudinaryImage(pendingPhotoRef.current);
      pendingPhotoRef.current = null;
    }
    setRemovePhoto(true);
    setNewPhoto(null);
  };

  const handleRemovePendingBanner = () => {
    if (pendingBannerRef.current) {
      void deleteCloudinaryImage(pendingBannerRef.current);
      pendingBannerRef.current = null;
    }
    setRemoveBanner(true);
    setNewBanner(null);
  };

  const handleChangeEmail = async (totpCode?: string) => {
    if (!newEmail.trim()) { CustomToast.warning("Informe o novo e-mail."); return; }
    setSavingEmail(true);
    try {
      const res = await fetch("/api/users/change-email/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_email: newEmail.trim(), current_password: emailPassword, totp_code: totpCode ?? "" }),
      });
      const data = (await res.json()) as { detail?: string; requires_2fa?: boolean };
      if (!res.ok) {
        if (data.requires_2fa) { setEmailNeedsTotp(true); return; }
        CustomToast.error(data.detail ?? "Erro ao alterar e-mail."); return;
      }
      await refreshMe();
      setEmailModalOpen(false);
      setEmailNeedsTotp(false);
      setNewEmail("");
      setEmailPassword("");
      CustomToast.success("E-mail alterado com sucesso!");
    } catch {
      CustomToast.error("Erro ao alterar e-mail.");
    } finally {
      setSavingEmail(false);
    }
  };

  const handleChangeUsername = async (totpCode?: string) => {
    if (!newUsername.trim()) { CustomToast.warning("Informe o novo username."); return; }
    setSavingUsername(true);
    try {
      const res = await fetch("/api/users/change-username/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_username: newUsername.trim(), totp_code: totpCode ?? "" }),
      });
      const data = (await res.json()) as { detail?: string; username?: string; requires_2fa?: boolean };
      if (!res.ok) {
        if (data.requires_2fa) { setUsernameNeedsTotp(true); return; }
        CustomToast.error(data.detail ?? "Erro ao alterar username."); return;
      }
      await refreshMe();
      await fetchProfile();
      setUsernameModalOpen(false);
      setUsernameNeedsTotp(false);
      setNewUsername("");
      CustomToast.success("Username alterado com sucesso!");
    } catch {
      CustomToast.error("Erro ao alterar username.");
    } finally {
      setSavingUsername(false);
    }
  };

  const handleDeleteAccount = async (totpCode?: string) => {
    setDeletingAccount(true);
    try {
      await deleteAccount({
        currentPassword: deletePassword,
        confirmation: deleteConfirmText,
        totpCode,
      });
      await logout();
    } catch (err: any) {
      if (err?.requires_2fa) {
        setDeleteNeedsTotp(true);
        return;
      }
      CustomToast.error(err?.message ?? "Não foi possível excluir a conta.");
    } finally {
      setDeletingAccount(false);
    }
  };

  const currentPhoto = removePhoto ? null : (newPhoto ?? profile?.profile_photo ?? null);
  const currentBanner = removeBanner ? null : (newBanner ?? profile?.profile_banner ?? null);
  const bannerSrc = currentBanner ? resolveGameMediaUrl(currentBanner) : null;
  const isSocialAccount = me ? !me.has_usable_password : false;

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

      {/* 2FA modals for sensitive actions */}
      <TwoFAVerifyModal
        open={emailNeedsTotp}
        onOpenChange={setEmailNeedsTotp}
        title="Confirmar mudança de e-mail"
        description="Informe o código 2FA para confirmar a alteração de e-mail."
        onConfirm={async (code) => { setEmailNeedsTotp(false); await handleChangeEmail(code); }}
      />
      <TwoFAVerifyModal
        open={usernameNeedsTotp}
        onOpenChange={setUsernameNeedsTotp}
        title="Confirmar mudança de username"
        description="Informe o código 2FA para confirmar a alteração de username."
        onConfirm={async (code) => { setUsernameNeedsTotp(false); await handleChangeUsername(code); }}
      />
      <TwoFAVerifyModal
        open={deleteNeedsTotp}
        onOpenChange={setDeleteNeedsTotp}
        title="Confirmar exclusão de conta"
        description="Informe o código 2FA para confirmar a exclusão da conta."
        onConfirm={async (code) => {
          setDeleteNeedsTotp(false);
          await handleDeleteAccount(code);
        }}
      />

      {/* Email change modal */}
      <Dialog open={emailModalOpen} onOpenChange={(o) => { setEmailModalOpen(o); if (!o) { setNewEmail(""); setEmailPassword(""); } }}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>Alterar e-mail</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              {isSocialAccount
                ? "Informe o novo endereço de e-mail para sua conta."
                : "Informe o novo e-mail e sua senha atual para confirmar a alteração."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Novo e-mail</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
                className="bg-background/50 border-border/50"
                onKeyDown={(e) => e.key === "Enter" && handleChangeEmail()}
              />
            </div>

            {!isSocialAccount && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Senha atual</Label>
                <div className="relative">
                  <Input
                    type={showEmailPassword ? "text" : "password"}
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-background/50 border-border/50 pr-10"
                    onKeyDown={(e) => e.key === "Enter" && handleChangeEmail()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmailPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showEmailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEmailModalOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                onClick={() => handleChangeEmail()}
                disabled={savingEmail}
                className="rounded-xl bg-gradient-primary hover:shadow-glow-primary transition-all"
              >
                {savingEmail ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Alterar e-mail"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Username change modal */}
      <Dialog open={usernameModalOpen} onOpenChange={(o) => { setUsernameModalOpen(o); if (!o) setNewUsername(""); }}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <AtSign className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>Alterar username</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              Você pode alterar seu username uma vez a cada 60 dias. Use apenas letras, números, pontos e underscores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Novo username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ""))}
                  placeholder={me?.username ?? "username"}
                  className="bg-background/50 border-border/50 pl-9"
                  maxLength={30}
                  onKeyDown={(e) => e.key === "Enter" && handleChangeUsername()}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {newUsername.length}/30 caracteres · letras, números, <code className="text-xs">.</code> e <code className="text-xs">_</code>
              </p>
            </div>

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Após alterar, você precisará aguardar <strong>60 dias</strong> para mudar novamente.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setUsernameModalOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                onClick={() => handleChangeUsername()}
                disabled={savingUsername}
                className="rounded-xl bg-gradient-primary hover:shadow-glow-primary transition-all"
              >
                {savingUsername ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Alterar username"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete account confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={(open) => {
        setDeleteConfirmOpen(open);
        if (!open) {
          setDeletePassword("");
          setDeleteConfirmText("");
        }
      }}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Isso é definitivo. Seu perfil, posts, cuts e comentários somem
              imediatamente para todo mundo, inclusive você. Por obrigação legal,
              seus dados ficam retidos internamente por até 90 dias antes de
              serem apagados de vez — depois disso, não há como recuperar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 pt-1">
            {isSocialAccount ? null : (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Senha atual</Label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Digite EXCLUIR para confirmar
              </Label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="EXCLUIR"
                className="bg-background/50 border-border/50"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                deletingAccount ||
                deleteConfirmText.trim().toUpperCase() !== "EXCLUIR" ||
                (!isSocialAccount && !deletePassword)
              }
              onClick={async (e) => {
                e.preventDefault();
                await handleDeleteAccount();
                setDeleteConfirmOpen(false);
              }}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAccount ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Excluindo...</>
              ) : (
                "Excluir conta"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SettingsPageWrapper
        title="Conta"
        description="Gerencie suas informações pessoais e aparência do perfil."
      >
        {/* Avatar & Banner */}
        <SettingsSection title="Foto & Banner">
          <div className="relative h-36 rounded-xl overflow-hidden bg-muted/60 flex items-center justify-center border border-border/50">
            {bannerSrc ? (
              <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <p className="text-xs text-muted-foreground">Sem banner</p>
            )}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <CldUploadWidget
                signatureEndpoint="/api/signed-profile-banner"
                uploadPreset={PresetsCloudinary.profile_banners}
                options={{
                  sources: ["local"],
                  multiple: false,
                  resourceType: "image",
                  cropping: true,
                  croppingAspectRatio: 3,
                  croppingCoordinatesMode: "custom",
                  language: "pt-br",
                  clientAllowedFormats: [...CLOUDINARY_IMAGE_FORMATS],
                  maxImageFileSize: BYTES_8_MB,
                }}
                onSuccess={(result: any) => {
                  const publicId = result?.info?.public_id;
                  if (typeof publicId === "string" && publicId) {
                    handlePendingBanner(publicId);
                  }
                }}
              >
                {({ open }) => (
                  <Button type="button" size="sm" variant="secondary" className="h-8 px-3 text-xs rounded-lg" onClick={() => open()}>
                    <Camera className="w-3.5 h-3.5 mr-1" />Alterar
                  </Button>
                )}
              </CldUploadWidget>
              {currentBanner && (
                <Button type="button" size="sm" variant="destructive" className="h-8 px-3 text-xs rounded-lg"
                  onClick={handleRemovePendingBanner}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <ProfileAvatar
              displayName={name || user?.username || ""}
              username={user?.username}
              profilePhoto={currentPhoto}
              sizeClass="h-16 w-16"
            />
            <div className="flex gap-2">
              <CldUploadWidget
                signatureEndpoint="/api/signed-profile"
                uploadPreset={PresetsCloudinary.profile_image}
                options={{
                  sources: ["local"],
                  multiple: false,
                  resourceType: "image",
                  cropping: true,
                  croppingAspectRatio: 1,
                  croppingCoordinatesMode: "custom",
                  language: "pt-br",
                  clientAllowedFormats: [...CLOUDINARY_IMAGE_FORMATS],
                  maxImageFileSize: BYTES_8_MB,
                }}
                onSuccess={(result: any) => {
                  const publicId = result?.info?.public_id;
                  if (typeof publicId === "string" && publicId) {
                    handlePendingPhoto(publicId);
                  }
                }}
              >
                {({ open }) => (
                  <Button type="button" size="sm" variant="outline" className="h-8 px-3 text-xs rounded-lg" onClick={() => open()}>
                    <Camera className="w-3.5 h-3.5 mr-1" />Alterar foto
                  </Button>
                )}
              </CldUploadWidget>
              {currentPhoto && (
                <Button type="button" size="sm" variant="ghost"
                  className="h-8 px-3 text-xs rounded-lg text-destructive hover:text-destructive"
                  onClick={handleRemovePendingPhoto}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" />Remover
                </Button>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Profile Info */}
        <SettingsSection title="Informações do perfil">
          <div className="space-y-4 p-4 rounded-xl bg-muted/50">
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

            {/* Username */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Username</Label>
                {me?.can_change_username ? (
                  <Button
                    type="button" variant="ghost" size="sm"
                    onClick={() => setUsernameModalOpen(true)}
                    className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                  >
                    <AtSign className="w-3.5 h-3.5" />
                    Alterar
                  </Button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {me?.username_days_remaining}d restantes
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                <Input
                  value={me?.username ?? user?.username ?? ""}
                  readOnly
                  disabled
                  className="bg-muted/50 border-border/40 text-muted-foreground cursor-not-allowed pl-9"
                />
              </div>
              {!me?.can_change_username && (
                <p className="text-xs text-muted-foreground">
                  Username alterado recentemente. Disponível para troca em {me?.username_days_remaining} dia(s).
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">E-mail</Label>
                <Button
                  type="button" variant="ghost" size="sm"
                  onClick={() => setEmailModalOpen(true)}
                  className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Alterar
                </Button>
              </div>
              <div className="relative">
                <Input
                  value={me?.email_masked ?? ""}
                  readOnly
                  disabled
                  className="bg-muted/50 border-border/40 text-muted-foreground font-mono cursor-not-allowed pr-8"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              </div>
              {isSocialAccount && (
                <p className="text-xs text-muted-foreground">
                  Conta vinculada via {me?.auth_provider === "google" ? "Google" : "Steam"}. Não é necessária senha para alterar o e-mail.
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Bio</Label>
                <span className="text-xs text-muted-foreground">{bio.length}/{PROFILE_BIO_MAX_LENGTH}</span>
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
            {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Salvar alterações"}
          </Button>
        </div>

        {/* Danger zone */}
        <SettingsSection title="Zona de risco">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm text-foreground">Excluir conta</p>
                <p className="text-sm text-muted-foreground">
                  Sua conta e todo o seu conteúdo somem imediatamente da Playgether.
                  Por obrigação legal, os dados ficam retidos internamente por até
                  90 dias antes de serem apagados de vez. Essa ação é definitiva —
                  não é possível recuperar a conta depois de confirmada.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Excluir conta
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}

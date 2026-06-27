"use client";

import { useEffect, useState, useCallback } from "react";
import { Lock, Ban, VolumeX, UserCheck, Volume2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { SettingsToggleRow } from "../components/SettingsToggleRow";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { getPreferences, patchPreferences, type UserPreferences } from "@/services/userPreferences";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
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

const AUDIENCE_OPTIONS = [
  { value: "everyone", label: "Todos" },
  { value: "followers", label: "Seguidores" },
  { value: "nobody", label: "Ninguém" },
];

interface RestrictedUser {
  id: number;
  user_id: number;
  username: string;
  name: string;
  profile_photo: string | null;
}

function resolveAvatar(photo: string | null | undefined): string | null {
  if (!photo) return null;
  if (photo.startsWith("http") || photo.startsWith("/")) return photo;
  return getCloudinaryUrl(photo);
}

function UserRow({
  user,
  actionLabel,
  actionIcon: ActionIcon,
  actionClass,
  onAction,
  loading,
}: {
  user: RestrictedUser;
  actionLabel: string;
  actionIcon: React.ElementType;
  actionClass: string;
  onAction: (profileId: number) => void;
  loading: boolean;
}) {
  const avatarSrc = resolveAvatar(user.profile_photo);
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
              {(user.name || user.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name || user.username}</p>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onAction(user.id)}
        disabled={loading}
        className={`text-xs rounded-lg shrink-0 ml-3 ${actionClass}`}
      >
        <ActionIcon className="w-3.5 h-3.5 mr-1.5" />
        {actionLabel}
      </Button>
    </div>
  );
}

function UserRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8 text-center">
      <Icon className="w-8 h-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function RestrictedUsersList({
  type,
}: {
  type: "blocked" | "muted";
}) {
  const [users, setUsers] = useState<RestrictedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${type}/`, { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as RestrictedUser[];
        setUsers(data);
      }
    } catch {
      CustomToast.error("Erro ao carregar lista.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRemove = async (profileId: number) => {
    setRemoving(profileId);
    const endpoint = type === "blocked"
      ? `/api/profiles/${profileId}/block/`
      : `/api/profiles/${profileId}/mute/`;
    try {
      const res = await fetch(endpoint, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== profileId));
        CustomToast.success(
          type === "blocked" ? "Usuário desbloqueado." : "Usuário dessilenciado."
        );
      } else {
        const data = (await res.json()) as { detail?: string };
        CustomToast.error(data.detail ?? "Erro ao processar.");
      }
    } catch {
      CustomToast.error("Erro ao processar.");
    } finally {
      setRemoving(null);
    }
  };

  const isBlocked = type === "blocked";
  const ActionIcon = isBlocked ? UserCheck : Volume2;
  const actionLabel = isBlocked ? "Desbloquear" : "Dessilenciar";
  const actionClass = isBlocked
    ? "text-destructive border-destructive/30 hover:bg-destructive/10"
    : "text-muted-foreground hover:text-foreground";
  const emptyText = isBlocked
    ? "Nenhum usuário bloqueado."
    : "Nenhum usuário silenciado.";
  const EmptyIcon = isBlocked ? Ban : VolumeX;

  if (loading) {
    return (
      <div className="space-y-2">
        <UserRowSkeleton />
        <UserRowSkeleton />
      </div>
    );
  }

  if (users.length === 0) {
    return <EmptyState icon={EmptyIcon} text={emptyText} />;
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserRow
          key={user.id}
          user={user}
          actionLabel={actionLabel}
          actionIcon={ActionIcon}
          actionClass={actionClass}
          onAction={handleRemove}
          loading={removing === user.id}
        />
      ))}
    </div>
  );
}

export default function PrivacySettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmPrivate, setConfirmPrivate] = useState(false);

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = async (patch: Partial<UserPreferences>) => {
    if (!prefs) return;
    const prev = prefs;
    setPrefs({ ...prefs, ...patch });
    try {
      const updated = await patchPreferences(patch);
      setPrefs(updated);
    } catch {
      setPrefs(prev);
      CustomToast.error("Erro ao salvar preferência.");
    }
  };

  const handlePrivateAccountToggle = (value: boolean) => {
    if (value) setConfirmPrivate(true);
    else update({ private_account: false });
  };

  return (
    <>
      <CustomToaster />

      <AlertDialog open={confirmPrivate} onOpenChange={setConfirmPrivate}>
        <AlertDialogContent className="bg-card border-border/50">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <AlertDialogTitle>Tornar conta privada?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Ao tornar sua conta privada:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Somente seguidores aprovados poderão ver seu perfil e posts</li>
                <li>Novos seguidores precisarão de aprovação</li>
                <li>Seguidores atuais continuarão tendo acesso normalmente</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmPrivate(false); update({ private_account: true }); }}
              className="rounded-xl bg-gradient-primary hover:shadow-glow-primary transition-all"
            >
              Tornar privada
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SettingsPageWrapper
        title="Privacidade"
        description="Controle quem pode ver e interagir com seu conteúdo."
      >
        <SettingsSection
          title="Visibilidade da conta"
          description="Controle a privacidade do seu perfil."
        >
          <SettingsToggleRow
            label="Conta privada"
            description="Somente seguidores aprovados podem ver seu perfil e posts. Seguir se torna uma solicitação."
            checked={prefs?.private_account ?? false}
            onCheckedChange={handlePrivateAccountToggle}
            loading={loading}
          />
          <SettingsToggleRow
            label="Mostrar lista de seguidores"
            description="Permite que outros vejam quem te segue."
            checked={prefs?.show_followers ?? true}
            onCheckedChange={(v) => update({ show_followers: v })}
            loading={loading}
          />
          <SettingsToggleRow
            label="Mostrar lista de seguindo"
            description="Permite que outros vejam quem você segue."
            checked={prefs?.show_following ?? true}
            onCheckedChange={(v) => update({ show_following: v })}
            loading={loading}
          />
          <SettingsToggleRow
            label="Mostrar status online"
            description="Exibe sua presença online para outros usuários."
            checked={prefs?.show_online_status ?? true}
            onCheckedChange={(v) => update({ show_online_status: v })}
            loading={loading}
          />
        </SettingsSection>

        <SettingsSection
          title="Visibilidade do conteúdo"
          description="Controle quem pode ver seus posts e atividades."
        >
          <SettingsSelectRow
            label="Quem pode ver meus posts"
            description="Define quem tem acesso ao seu feed e publicações."
            value={prefs?.who_can_see_posts ?? "everyone"}
            options={AUDIENCE_OPTIONS}
            onValueChange={(v) => update({ who_can_see_posts: v as UserPreferences["who_can_see_posts"] })}
            loading={loading}
          />
        </SettingsSection>

        <SettingsSection
          title="Interações"
          description="Defina quem pode interagir com você e seu conteúdo."
        >
          <SettingsSelectRow
            label="Quem pode me enviar mensagem"
            description="Controla quem tem permissão para iniciar conversas com você."
            value={prefs?.who_can_message ?? "everyone"}
            options={AUDIENCE_OPTIONS}
            onValueChange={(v) => update({ who_can_message: v as UserPreferences["who_can_message"] })}
            loading={loading}
          />
          <SettingsSelectRow
            label="Quem pode comentar meus posts"
            description="Controla quem pode deixar comentários nos seus posts."
            value={prefs?.who_can_comment ?? "everyone"}
            options={AUDIENCE_OPTIONS}
            onValueChange={(v) => update({ who_can_comment: v as UserPreferences["who_can_comment"] })}
            loading={loading}
          />
          <SettingsSelectRow
            label="Quem pode me marcar"
            description="Controla quem pode te marcar em posts e comentários."
            value={prefs?.who_can_tag ?? "everyone"}
            options={AUDIENCE_OPTIONS}
            onValueChange={(v) => update({ who_can_tag: v as UserPreferences["who_can_tag"] })}
            loading={loading}
          />
        </SettingsSection>

        <SettingsSection
          title="Usuários restritos"
          description="Gerencie usuários bloqueados e silenciados."
        >
          <Tabs defaultValue="blocked" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="blocked" className="gap-2">
                <Ban className="w-3.5 h-3.5" />
                Bloqueados
              </TabsTrigger>
              <TabsTrigger value="muted" className="gap-2">
                <VolumeX className="w-3.5 h-3.5" />
                Silenciados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="blocked">
              <div className="space-y-1.5 mb-3">
                <p className="text-xs text-muted-foreground px-1">
                  Usuários bloqueados não podem ver seu perfil, posts ou enviar mensagens. O bloqueio também remove o follow nos dois sentidos.
                </p>
              </div>
              <RestrictedUsersList type="blocked" />
            </TabsContent>

            <TabsContent value="muted">
              <div className="space-y-1.5 mb-3">
                <p className="text-xs text-muted-foreground px-1">
                  Usuários silenciados continuam podendo ver seu perfil, mas seus posts e comentários não aparecem no seu feed.
                </p>
              </div>
              <RestrictedUsersList type="muted" />
            </TabsContent>
          </Tabs>
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}

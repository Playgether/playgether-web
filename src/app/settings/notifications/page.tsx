"use client";

import { useEffect, useState } from "react";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { SettingsToggleRow } from "../components/SettingsToggleRow";
import { getPreferences, patchPreferences, type UserPreferences } from "@/services/userPreferences";

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreferences()
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = async (patch: Partial<UserPreferences>) => {
    if (!prefs) return;
    const optimistic = { ...prefs, ...patch };
    setPrefs(optimistic);
    try {
      const updated = await patchPreferences(patch);
      setPrefs(updated);
    } catch {
      setPrefs(prefs);
      CustomToast.error("Erro ao salvar preferência.");
    }
  };

  const items: Array<{
    key: keyof UserPreferences;
    label: string;
    description: string;
  }> = [
    { key: "notif_likes", label: "Curtidas", description: "Quando alguém curtir seu post, cut, comentário ou perfil." },
    { key: "notif_comments", label: "Comentários", description: "Quando alguém comentar no seu post, cut ou perfil." },
    { key: "notif_new_followers", label: "Novos seguidores", description: "Quando alguém começar a te seguir." },
    { key: "notif_messages", label: "Mensagens privadas", description: "Quando você receber uma nova mensagem direta." },
    { key: "notif_mentions", label: "Menções", description: "Quando alguém te mencionar em um post, cut ou comentário." },
    { key: "notif_clan_invites", label: "Convites para salas", description: "Quando você for convidado para entrar em uma sala." },
    { key: "notif_friend_requests", label: "Solicitações de amizade", description: "Quando alguém quiser te seguir (conta privada)." },
    { key: "notif_platform_updates", label: "Atualizações da plataforma", description: "Novidades, features e comunicados da PlayGether." },
  ];

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Notificações"
        description="Escolha quais notificações você quer receber."
      >
        <SettingsSection
          title="Preferências de notificação"
          description="Desative tipos específicos de notificação. As alterações são salvas automaticamente."
        >
          {items.map((item) => (
            <SettingsToggleRow
              key={item.key}
              label={item.label}
              description={item.description}
              checked={prefs ? (prefs[item.key] as boolean) : true}
              onCheckedChange={(v) => update({ [item.key]: v })}
              loading={loading}
            />
          ))}
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}

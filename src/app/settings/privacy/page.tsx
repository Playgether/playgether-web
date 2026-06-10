"use client";

import { useEffect, useState } from "react";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { SettingsToggleRow } from "../components/SettingsToggleRow";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { getPreferences, patchPreferences, type UserPreferences } from "@/services/userPreferences";

const AUDIENCE_OPTIONS = [
  { value: "everyone", label: "Todos" },
  { value: "followers", label: "Seguidores" },
  { value: "nobody", label: "Ninguém" },
];

export default function PrivacySettingsPage() {
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

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Privacidade"
        description="Controle quem pode ver e interagir com seu conteúdo."
      >
        {/* Account visibility */}
        <SettingsSection
          title="Visibilidade da conta"
          description="Controle a privacidade do seu perfil."
        >
          <SettingsToggleRow
            label="Conta privada"
            description="Somente seguidores aprovados podem ver seu perfil e posts. Seguir se torna uma solicitação."
            checked={prefs?.private_account ?? false}
            onCheckedChange={(v) => update({ private_account: v })}
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

        {/* Interactions */}
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
      </SettingsPageWrapper>
    </>
  );
}

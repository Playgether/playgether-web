"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { SettingsToggleRow } from "../components/SettingsToggleRow";
import { SettingsSelectRow } from "../components/SettingsSelectRow";
import { getPreferences, patchPreferences, type UserPreferences } from "@/services/userPreferences";
import { cn } from "@/lib/utils";

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
];

export default function AppearanceSettingsPage() {
  const { setTheme, resolvedTheme } = useTheme();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreferences()
      .then((data) => {
        // Normalize legacy "system" default to "dark" on load
        const normalized = data.theme === "system" ? { ...data, theme: "dark" as const } : data;
        setPrefs(normalized);
        setTheme(normalized.theme);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = async (patch: Partial<UserPreferences>) => {
    if (!prefs) return;
    const optimistic = { ...prefs, ...patch };
    setPrefs(optimistic);
    if (patch.theme) setTheme(patch.theme);
    try {
      const updated = await patchPreferences(patch);
      setPrefs(updated);
      CustomToast.success("Preferência salva!");
    } catch {
      setPrefs(prefs);
      if (patch.theme) setTheme(prefs.theme);
      CustomToast.error("Erro ao salvar preferência.");
    }
  };

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Aparência"
        description="Personalize a aparência visual da plataforma."
      >
        {/* Theme */}
        <SettingsSection title="Tema">
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const active = (prefs?.theme ?? "dark") === opt.value;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ theme: opt.value as UserPreferences["theme"] })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </SettingsSection>

        {/* Display options */}
        <SettingsSection title="Exibição">
          <SettingsToggleRow
            label="Reduzir animações"
            description="Desativa transições e animações da interface."
            checked={prefs?.reduce_animations ?? false}
            onCheckedChange={(v) => update({ reduce_animations: v })}
            loading={loading}
          />
          <SettingsSelectRow
            label="Densidade da interface"
            description="Controla o espaçamento entre os elementos."
            value={prefs?.ui_density ?? "normal"}
            options={[
              { value: "normal", label: "Normal" },
              { value: "compact", label: "Compacto" },
            ]}
            onValueChange={(v) => update({ ui_density: v as UserPreferences["ui_density"] })}
            loading={loading}
          />
          <SettingsSelectRow
            label="Tamanho da fonte"
            description="Ajusta o tamanho do texto exibido."
            value={prefs?.font_size ?? "medium"}
            options={[
              { value: "small", label: "Pequeno" },
              { value: "medium", label: "Médio" },
              { value: "large", label: "Grande" },
            ]}
            onValueChange={(v) => update({ font_size: v as UserPreferences["font_size"] })}
            loading={loading}
          />
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { apiFetch } from "@/services/apiFetch";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      CustomToast.warning("Preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      CustomToast.error("As senhas não conferem.");
      return;
    }
    if (newPassword.length < 8) {
      CustomToast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setSaving(true);
    try {
      const resp = await apiFetch("/api/auth/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        CustomToast.error((data as any)?.detail ?? "Erro ao alterar senha.");
        return;
      }
      CustomToast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      CustomToast.error("Erro ao alterar senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <CustomToaster />
      <SettingsPageWrapper
        title="Segurança"
        description="Gerencie a segurança da sua conta."
      >
        {/* Change password */}
        <SettingsSection
          title="Alterar senha"
          description="Sua senha deve ter pelo menos 8 caracteres."
        >
          <div className="space-y-4 p-4 rounded-xl bg-muted/20">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Senha atual</Label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Nova senha</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Confirmar nova senha</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-border/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar senha
                </>
              )}
            </Button>
          </div>
        </SettingsSection>

        {/* 2FA - Placeholder */}
        <SettingsSection
          title="Autenticação em dois fatores"
          description="Adicione uma camada extra de segurança à sua conta."
        >
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">2FA via aplicativo</p>
                <p className="text-xs text-muted-foreground">Não configurado</p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled className="text-xs rounded-lg">
              Em breve
            </Button>
          </div>
        </SettingsSection>

      </SettingsPageWrapper>
    </>
  );
}

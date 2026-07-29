"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye, EyeOff, Loader2, Lock, Shield, ShieldCheck, ShieldOff,
  Copy, Check, RefreshCw,
} from "lucide-react";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { SettingsPageWrapper, SettingsSection } from "../components/SettingsPageWrapper";
import { apiFetch } from "@/services/apiFetch";
import { TwoFAVerifyModal } from "@/components/ui/TwoFAVerifyModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

interface TwoFASetup {
  is_configured: boolean;
  is_enabled: boolean;
  secret: string | null;
  uri: string | null;
}

function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  label,
  onEnter,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
  onEnter?: () => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-background/50 border-border/50 pr-10"
          onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export default function SecuritySettingsPage() {
  // ── Password change ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordNeedsTotp, setPasswordNeedsTotp] = useState(false);

  // ── 2FA state ────────────────────────────────────────────────────────────────
  const [setup, setSetup] = useState<TwoFASetup | null>(null);
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [enablingTotp, setEnablingTotp] = useState(false);
  const [copied, setCopied] = useState(false);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  // On load: GET status only — never generates a secret
  const fetchStatus = async () => {
    setLoadingSetup(true);
    try {
      const res = await fetch("/api/users/2fa/setup/", { credentials: "include" });
      if (res.ok) setSetup(await res.json());
    } finally {
      setLoadingSetup(false);
    }
  };

  // When user opens setup/re-enable modal: POST to generate/retrieve secret + QR
  const loadSetupData = async () => {
    const res = await fetch("/api/users/2fa/setup/", { method: "POST", credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as TwoFASetup;
    setSetup(data);
    if (data.uri) {
      const qrRes = await fetch(`/api/users/2fa/qr/?uri=${encodeURIComponent(data.uri)}`, { credentials: "include" });
      if (qrRes.ok) {
        const blob = await qrRes.blob();
        setQrDataUrl(URL.createObjectURL(blob));
      }
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleCopySecret = async () => {
    if (!setup?.secret) return;
    await navigator.clipboard.writeText(setup.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnableTotp = async () => {
    if (setupCode.length < 6) { CustomToast.warning("Informe o código de 6 dígitos."); return; }
    setEnablingTotp(true);
    try {
      const res = await fetch("/api/users/2fa/enable/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode }),
      });
      const data = (await res.json()) as { detail?: string };
      if (!res.ok) { CustomToast.error(data.detail ?? "Erro ao ativar 2FA."); return; }
      setSetup((prev) => prev ? { ...prev, is_enabled: true } : prev);
      setSetupModalOpen(false);
      setSetupCode("");
      CustomToast.success("2FA ativado com sucesso!");
    } finally {
      setEnablingTotp(false);
    }
  };

  const handleOpenSetup = async () => {
    setIsFirstTimeSetup(!isConfigured); // capture BEFORE loadSetupData changes isConfigured
    setSetupCode("");
    setSetupModalOpen(true);
    await loadSetupData();
  };

  const handleReEnable = async () => {
    await handleOpenSetup();
  };

  const handleDisableTotp = async (code: string) => {
    const res = await fetch("/api/users/2fa/disable/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as { detail?: string };
    if (!res.ok) {
      CustomToast.error(data.detail ?? "Erro ao desativar 2FA.");
      throw new Error(data.detail);
    }
    setSetup((prev) => prev ? { ...prev, is_enabled: false } : prev);
    setDisableModalOpen(false);
    CustomToast.success("2FA desativado.");
  };

  // ── Password change ──────────────────────────────────────────────────────────
  const submitPasswordChange = async (totpCode?: string) => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      CustomToast.warning("Preencha todos os campos."); return;
    }
    if (newPassword !== confirmPassword) { CustomToast.error("As senhas não conferem."); return; }
    if (newPassword.length < 8) { CustomToast.error("A nova senha deve ter pelo menos 8 caracteres."); return; }

    setSavingPassword(true);
    try {
      const resp = await apiFetch("/api/auth/change-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
          totp_code: totpCode ?? "",
        }),
      });
      const data = await resp.json().catch(() => ({})) as { detail?: string; requires_2fa?: boolean };
      if (!resp.ok) {
        if (data.requires_2fa) { setPasswordNeedsTotp(true); return; }
        CustomToast.error(data.detail ?? "Erro ao alterar senha."); return;
      }
      CustomToast.success("Senha alterada com sucesso!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } finally {
      setSavingPassword(false);
    }
  };

  const isConfigured = setup?.is_configured ?? false;
  const isEnabled = setup?.is_enabled ?? false;

  return (
    <>
      <CustomToaster />

      {/* 2FA setup/re-enable modal */}
      <Dialog open={setupModalOpen} onOpenChange={(o) => { setSetupModalOpen(o); if (!o) setSetupCode(""); }}>
        <DialogContent className="bg-card border-border/50 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>
                {isFirstTimeSetup ? "Configurar 2FA" : "Reativar 2FA"}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground">
              {isFirstTimeSetup
                ? "Escaneie o QR code com Google Authenticator, Microsoft Authenticator ou similar."
                : "Sua configuração anterior foi mantida. Informe o código do seu aplicativo para reativar."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {qrDataUrl && (
              <div className="flex flex-col items-center gap-3">
                <div className="p-2 rounded-xl bg-white">
                  <img src={qrDataUrl} alt="QR Code 2FA" className="w-44 h-44" />
                </div>
                <div className="w-full space-y-1">
                  <p className="text-xs text-muted-foreground text-center">Ou copie a chave manualmente:</p>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/60 border border-border/40">
                    <code className="flex-1 text-xs font-mono break-all text-foreground">{setup?.secret}</code>
                    <button type="button" onClick={handleCopySecret} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Código de verificação</Label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={setupCode}
                onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="bg-background/50 border-border/50 text-center text-2xl tracking-[0.4em] font-mono"
                onKeyDown={(e) => e.key === "Enter" && handleEnableTotp()}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSetupModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-xl bg-gradient-primary hover:shadow-glow-primary transition-all"
                onClick={handleEnableTotp}
                disabled={enablingTotp || setupCode.length < 6}
              >
                {enablingTotp ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Ativar 2FA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2FA disable modal */}
      <TwoFAVerifyModal
        open={disableModalOpen}
        onOpenChange={setDisableModalOpen}
        title="Desativar 2FA"
        description="Informe o código do seu aplicativo autenticador para desativar o 2FA."
        onConfirm={handleDisableTotp}
      />

      {/* Password 2FA modal */}
      <TwoFAVerifyModal
        open={passwordNeedsTotp}
        onOpenChange={setPasswordNeedsTotp}
        title="Confirmar mudança de senha"
        description="Informe o código 2FA para confirmar a alteração de senha."
        onConfirm={async (code) => {
          setPasswordNeedsTotp(false);
          await submitPasswordChange(code);
        }}
      />

      <SettingsPageWrapper title="Segurança" description="Gerencie a segurança da sua conta.">
        {/* Change password */}
        <SettingsSection title="Alterar senha" description="Sua senha deve ter pelo menos 8 caracteres.">
          <div className="space-y-4 p-4 rounded-xl bg-muted/50">
            <PasswordInput label="Senha atual" value={currentPassword} onChange={setCurrentPassword} />
            <PasswordInput label="Nova senha" value={newPassword} onChange={setNewPassword} />
            <PasswordInput
              label="Confirmar nova senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onEnter={() => submitPasswordChange()}
            />
            <Button
              onClick={() => submitPasswordChange()}
              disabled={savingPassword}
              className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
            >
              {savingPassword
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
                : <><Lock className="w-4 h-4 mr-2" />Alterar senha</>}
            </Button>
          </div>
        </SettingsSection>

        {/* 2FA */}
        <SettingsSection
          title="Autenticação em dois fatores"
          description="Adicione uma camada extra de segurança. Compatível com Google Authenticator, Microsoft Authenticator e qualquer app TOTP."
        >
          {loadingSetup ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-muted" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-muted" />
                  <div className="h-3 w-20 rounded bg-muted" />
                </div>
              </div>
              <div className="h-8 w-20 rounded-lg bg-muted" />
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                {isEnabled
                  ? <ShieldCheck className="w-5 h-5 text-green-500" />
                  : <Shield className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium text-foreground">2FA via aplicativo</p>
                  <p className={`text-xs ${isEnabled ? "text-green-500" : "text-muted-foreground"}`}>
                    {isEnabled ? "Ativo" : isConfigured ? "Desativado (configuração salva)" : "Não configurado"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isEnabled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDisableModalOpen(true)}
                    className="text-xs rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <ShieldOff className="w-3.5 h-3.5 mr-1.5" />
                    Desativar
                  </Button>
                ) : isConfigured ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReEnable}
                    className="text-xs rounded-lg text-green-600 border-green-600/30 hover:bg-green-600/10"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                    Reativar
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenSetup}
                    className="text-xs rounded-lg"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Configurar
                  </Button>
                )}
              </div>
            </div>
          )}

          {isEnabled && (
            <div className="mt-2 p-3 rounded-xl bg-green-500/5 border border-green-500/20">
              <p className="text-xs text-green-600 dark:text-green-400">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
                2FA ativo — Seu login e ações sensíveis (senha, e-mail, username, conta privada) requerem confirmação adicional.
              </p>
            </div>
          )}
        </SettingsSection>
      </SettingsPageWrapper>
    </>
  );
}

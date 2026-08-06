"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";

type Stage = "validating" | "invalid" | "form" | "success";

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Fraca", "Razoável", "Boa", "Forte"];

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : "bg-muted/40"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{labels[score]}</p>
    </div>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") ?? "";

  const [stage, setStage] = useState<Stage>("validating");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setStage("invalid");
      return;
    }

    fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => setStage(data.valid ? "form" : "invalid"))
      .catch(() => setStage("invalid"));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (password.length < 8) {
      CustomToast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      CustomToast.error("As senhas não conferem.");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, password_confirmation: confirm }),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        CustomToast.error((data as any)?.detail ?? "Erro ao redefinir senha.");
        return;
      }

      setStage("success");
    } catch {
      CustomToast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <CustomToaster />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center -space-x-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-secondary shadow-glow-secondary" />
            <div className="w-11 h-11 rounded-full bg-neon-blue shadow-glow-neon" />
          </div>
          <h1 className="text-2xl font-bold tracking-[0.2em]">
            <span className="text-secondary">PLAY</span>
            <span className="text-neon-blue">GETHER</span>
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-glow-primary overflow-hidden">
          {/* ── Validating ── */}
          {stage === "validating" && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Validando link de recuperação...</p>
            </div>
          )}

          {/* ── Invalid / expired ── */}
          {stage === "invalid" && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 mb-5">
                <XCircle className="w-7 h-7 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Este link de recuperação não é mais válido. Os links expiram em 15 minutos
                e só podem ser usados uma vez.
              </p>
              <Button
                onClick={() => router.push("/forgot-password")}
                className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
              >
                Solicitar novo link
              </Button>
            </div>
          )}

          {/* ── Form ── */}
          {stage === "form" && (
            <div className="p-8">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Nova senha</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Escolha uma senha segura para sua conta.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Nova senha</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background/40 border-border/60 placeholder:text-muted-foreground focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Confirmar senha</Label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      disabled={loading}
                      className={`bg-background/40 border-border/60 placeholder:text-muted-foreground focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300 pr-10 ${
                        passwordsMismatch ? "border-destructive focus:border-destructive" : ""
                      } ${passwordsMatch ? "border-green-500 focus:border-green-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordsMismatch && (
                    <p className="text-xs text-destructive">As senhas não conferem.</p>
                  )}
                  {passwordsMatch && (
                    <p className="text-xs text-green-400">Senhas conferem.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !password || !confirm || passwordsMismatch}
                  className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* ── Success ── */}
          {stage === "success" && (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">Senha alterada!</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Sua senha foi redefinida com sucesso. Você já pode entrar na sua conta.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
              >
                Ir para o login
              </Button>
            </div>
          )}

          {/* Back link (form stage only) */}
          {(stage === "form" || stage === "invalid") && (
            <div className="px-8 pb-6 pt-0">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";

type Stage = "form" | "sent";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("form");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submittingRef.current) return;
    submittingRef.current = true;

    setLoading(true);
    try {
      const resp = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (!resp.ok && resp.status !== 200) {
        CustomToast.error("Algo deu errado. Tente novamente em instantes.");
        return;
      }

      setStage("sent");
    } catch {
      CustomToast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

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
          {stage === "form" ? (
            <div className="p-8">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Recuperar senha</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Informe seu e-mail e enviaremos um link para criar uma nova senha.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">E-mail</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-background/40 border-border/60 placeholder:text-muted-foreground focus:border-neon-blue focus:shadow-glow-neon transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mb-5">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-3">Verifique seu e-mail</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Se existir uma conta com o e-mail{" "}
                <span className="font-medium text-foreground">{email}</span>,
                enviaremos instruções para recuperação em instantes.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Não recebeu? Verifique a pasta de spam ou{" "}
                <button
                  type="button"
                  onClick={() => setStage("form")}
                  className="text-primary hover:underline font-medium"
                >
                  tente novamente
                </button>
                .
              </p>
            </div>
          )}

          {/* Footer link */}
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
        </div>
      </div>
    </div>
  );
}

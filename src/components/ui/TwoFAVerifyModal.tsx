"use client";

import { useState, useRef, useEffect } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface TwoFAVerifyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  onConfirm: (code: string) => Promise<void>;
}

export function TwoFAVerifyModal({
  open,
  onOpenChange,
  title = "Verificação em dois fatores",
  description = "Informe o código do seu aplicativo autenticador para continuar.",
  onConfirm,
}: TwoFAVerifyModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setCode("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (code.length < 6) return;
    setLoading(true);
    try {
      await onConfirm(code);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { onOpenChange(o); setCode(""); } }}>
      <DialogContent className="bg-card border-border/50 max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Código 2FA</Label>
            <Input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="bg-background/50 border-border/50 text-center text-2xl tracking-[0.4em] font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            />
            <p className="text-xs text-muted-foreground text-center">
              O código é gerado pelo seu aplicativo autenticador e muda a cada 30 segundos.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => { onOpenChange(false); setCode(""); }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 rounded-xl bg-gradient-primary hover:shadow-glow-primary transition-all"
              onClick={handleConfirm}
              disabled={loading || code.length < 6}
            >
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Confirmar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

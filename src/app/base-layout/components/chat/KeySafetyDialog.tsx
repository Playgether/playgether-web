"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

type KeySafetyDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  peerName: string;
  peerUsername?: string;
  fingerprint: string | null;
  changed?: boolean;
  onConfirmTrust?: () => void;
};

export function KeySafetyDialog({
  open,
  onOpenChange,
  peerName,
  peerUsername,
  fingerprint,
  changed = false,
  onConfirmTrust,
}: KeySafetyDialogProps) {
  const label = peerUsername ? `@${peerUsername}` : peerName;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Código de segurança
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-muted-foreground">
              {changed ? (
                <p>
                  A chave de criptografia de <span className="font-medium text-foreground">{label}</span>{" "}
                  mudou. Confirme o código com a pessoa (por outro canal) se quiser ter certeza
                  de que a conversa continua segura.
                </p>
              ) : (
                <p>
                  Compare este código com o de{" "}
                  <span className="font-medium text-foreground">{label}</span>. Se for o mesmo dos
                  dois lados, a criptografia está íntegra.
                </p>
              )}
              <div className="rounded-lg border border-border/60 bg-muted/40 px-3 py-3">
                {fingerprint ? (
                  <p className="font-mono text-center text-sm tracking-wider text-foreground">
                    {fingerprint}
                  </p>
                ) : (
                  <p className="text-center text-sm">Chave indisponível.</p>
                )}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Fechar</AlertDialogCancel>
          {changed && onConfirmTrust ? (
            <Button
              type="button"
              onClick={() => {
                onConfirmTrust();
                onOpenChange(false);
              }}
            >
              Confiar nesta chave
            </Button>
          ) : null}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

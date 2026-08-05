"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomToast } from "@/components/ui/customSonner";
import { Cut } from "@/types/Cut";

interface CutEmbedDialogProps {
  cut: Cut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CutEmbedDialog({ cut, open, onOpenChange }: CutEmbedDialogProps) {
  const [copied, setCopied] = useState(false);

  const embedUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/cuts/${cut.id}/embed`;
  }, [cut.id]);

  const embedCode = useMemo(
    () =>
      `<iframe src="${embedUrl}" width="340" height="605" frameborder="0" scrolling="no" allowfullscreen title="Cut de @${cut.username} no Playgether"></iframe>`,
    [embedUrl, cut.username],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      CustomToast.success("Código copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      CustomToast.error("Não foi possível copiar o código.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Incorporar cut</DialogTitle>
        </DialogHeader>

        <div className="mx-auto overflow-hidden rounded-xl border border-border/50" style={{ width: 200, height: 356 }}>
          <iframe
            src={embedUrl}
            width={200}
            height={356}
            title={`Preview do cut de @${cut.username}`}
            className="border-0"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Cole este código em qualquer site:</p>
          <div className="relative">
            <pre className="max-h-28 overflow-auto rounded-lg bg-muted/60 p-3 text-xs text-foreground">
              <code>{embedCode}</code>
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground hover:text-primary"
              aria-label="Copiar código"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar código"}
        </button>
      </DialogContent>
    </Dialog>
  );
}

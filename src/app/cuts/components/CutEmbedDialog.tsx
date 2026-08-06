"use client";

import { useMemo, useState } from "react";
import { Check, Code2, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomToast } from "@/components/ui/customSonner";
import { Cut } from "@/types/Cut";
import { SharedCutCard } from "@/app/base-layout/components/chat/SharedCutCard";
import type { SharedCutContent } from "@/lib/sharedContent";

interface CutEmbedDialogProps {
  cut: Cut;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CutEmbedDialog({ cut, open, onOpenChange }: CutEmbedDialogProps) {
  const [copied, setCopied] = useState(false);

  const previewContent: SharedCutContent = useMemo(
    () => ({
      type: "cut",
      id: cut.id,
      username: cut.username,
      name: cut.name,
      caption: cut.caption,
      videoFile: cut.video_file,
      duration: cut.duration,
      profilePhoto: cut.profile_photo,
    }),
    [cut],
  );

  const embedUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/cuts/${cut.id}/embed`;
  }, [cut.id]);

  const embedCode = useMemo(
    () =>
      `<iframe\n  src="${embedUrl}"\n  width="340"\n  height="605"\n  frameborder="0"\n  scrolling="no"\n  allowfullscreen\n  title="Cut de @${cut.username} no Playgether"\n></iframe>`,
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
      <DialogContent className="max-w-lg border-border/50 bg-background/95 backdrop-blur-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            Incorporar cut
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Cole este código em qualquer site para exibir o cut com o player da Playgether.
          </p>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <SharedCutCard content={previewContent} onClick={() => {}} />
          </div>
          <div className="flex-1 space-y-2 text-sm text-muted-foreground">
            <p>É assim que o cut vai aparecer para quem visitar a página incorporada.</p>
            <ul className="list-inside list-disc space-y-1 text-xs">
              <li>Funciona em qualquer site que aceite HTML/iframe.</li>
              <li>O player é público — não exige login para assistir.</li>
              <li>Sempre linka de volta ao perfil do autor na Playgether.</li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-foreground">Código de incorporação</p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>
          <pre className="max-h-40 overflow-auto rounded-xl border border-border/50 bg-muted/60 p-3 text-xs leading-relaxed text-foreground">
            <code>{embedCode}</code>
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

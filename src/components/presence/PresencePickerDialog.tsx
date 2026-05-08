"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ManualPresenceMode } from "@/context/PresenceContext";

const OPTIONS: {
  value: ManualPresenceMode;
  title: string;
  description: string;
}[] = [
  {
    value: "auto",
    title: "Automático",
    description:
      "Online enquanto você usa o app; ausente só após vários minutos sem interagir.",
  },
  {
    value: "online",
    title: "Online",
    description: "Amigos veem você como online o tempo todo.",
  },
  {
    value: "away",
    title: "Ausente",
    description: "Aparece como ausente até você mudar de novo.",
  },
  {
    value: "dnd",
    title: "Não perturbe",
    description: "Indica que você não quer ser incomodado.",
  },
  {
    value: "offline",
    title: "Invisível",
    description: "Outros veem você offline, mesmo com o app aberto.",
  },
];

export function PresencePickerDialog({
  open,
  onOpenChange,
  manualPresenceMode,
  setManualPresenceMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  manualPresenceMode: ManualPresenceMode;
  setManualPresenceMode: (m: ManualPresenceMode) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seu status</DialogTitle>
          <DialogDescription>
            Escolha como os amigos veem você. Automático segue seu uso do app.
          </DialogDescription>
        </DialogHeader>
        <ul className="grid gap-2 py-2">
          {OPTIONS.map((opt) => {
            const selected = manualPresenceMode === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    setManualPresenceMode(opt.value);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border/60 hover:bg-muted/50",
                  )}
                >
                  <span className="font-medium text-foreground">{opt.title}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {opt.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

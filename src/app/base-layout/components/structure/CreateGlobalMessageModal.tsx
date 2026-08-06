"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Megaphone, Loader2, Volume, Volume1, Volume2 } from "lucide-react";
import { CustomToast } from "@/components/ui/customSonner";
import {
  createGlobalMessage,
  getGlobalMessagesQuota,
  type GlobalMessageLevel,
  type GlobalMessagesQuota,
  type GlobalMessagesSnapshot,
} from "@/services/globalMessages";

const LEVEL_META: Record<
  GlobalMessageLevel,
  {
    label: string;
    description: string;
    duration: string;
    icon: typeof Volume;
    accent: string;
  }
> = {
  low: {
    label: "Volume Baixo",
    description: "Aparece no alto-falante com destaque sutil",
    duration: "10s",
    icon: Volume,
    accent: "border-border/60 data-[selected=true]:border-primary/40 data-[selected=true]:bg-primary/5",
  },
  medium: {
    label: "Volume Médio",
    description: "Mais tempo e destaque visual",
    duration: "20s",
    icon: Volume1,
    accent:
      "border-blue-500/20 data-[selected=true]:border-blue-500/50 data-[selected=true]:bg-blue-500/5",
  },
  high: {
    label: "Volume Máximo",
    description: "Máximo alcance e prioridade na rotação",
    duration: "30s",
    icon: Volume2,
    accent:
      "border-emerald-500/20 data-[selected=true]:border-emerald-500/50 data-[selected=true]:bg-emerald-500/5",
  },
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (active: GlobalMessagesSnapshot) => void;
};

function QuotaMeter({
  label,
  remaining,
  limit,
  tone,
}: {
  label: string;
  remaining: number;
  limit: number;
  tone: "neutral" | "blue" | "green" | "amber";
}) {
  const used = Math.max(0, limit - remaining);
  const pct = limit > 0 ? Math.min(100, (remaining / limit) * 100) : 0;
  const bar =
    tone === "blue"
      ? "bg-blue-500"
      : tone === "green"
        ? "bg-emerald-500"
        : tone === "amber"
          ? "bg-amber-500"
          : "bg-primary";
  const chip =
    tone === "blue"
      ? "bg-blue-500/10 text-blue-600 dark:text-blue-300"
      : tone === "green"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
        : tone === "amber"
          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
          : "bg-primary/10 text-primary";

  return (
    <div className="rounded-xl border border-border/50 bg-background/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${chip}`}>
          {remaining}/{limit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
        <div
          className={`h-full rounded-full transition-all ${bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {remaining === 0
          ? "Limite atingido nesta semana"
          : used === 0
            ? "Todas disponíveis"
            : `${used} usada${used > 1 ? "s" : ""} nesta semana`}
      </p>
    </div>
  );
}

export function CreateGlobalMessageModal({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const [body, setBody] = useState("");
  const [level, setLevel] = useState<GlobalMessageLevel>("low");
  const [quota, setQuota] = useState<GlobalMessagesQuota | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuota, setLoadingQuota] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingQuota(true);
    getGlobalMessagesQuota()
      .then((q) => setQuota(q))
      .finally(() => setLoadingQuota(false));
  }, [open]);

  const canUseLevel = (lvl: GlobalMessageLevel) => {
    if (!quota) return true;
    if (quota.total_remaining <= 0) return false;
    if (lvl === "low") return quota.low_remaining > 0;
    if (lvl === "medium") return quota.medium_remaining > 0;
    if (lvl === "high") return quota.high_remaining > 0;
    return false;
  };

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (!trimmed || submitting) return;
    if (!canUseLevel(level)) {
      CustomToast.warning("Cota semanal insuficiente para este volume.");
      return;
    }

    setSubmitting(true);
    const result = await createGlobalMessage({ body: trimmed, level });
    setSubmitting(false);

    if (!result.ok) {
      if (result.quota) setQuota(result.quota);
      CustomToast.error(result.error || "Falha ao enviar.");
      return;
    }

    if (result.data?.quota) setQuota(result.data.quota);
    if (result.data?.active) onCreated?.(result.data.active);
    CustomToast.success("Mensagem enviada ao alto-falante!", {
      description:
        result.data?.message.status === "pending"
          ? "Ela entrou na fila e será exibida em breve."
          : "Ela já está sendo exibida.",
    });
    setBody("");
    setLevel("low");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[60] flex max-h-[min(85dvh,720px)] max-w-lg flex-col gap-0 overflow-hidden border border-primary/20 bg-background/95 p-0 backdrop-blur-xl">
        <DialogHeader className="shrink-0 border-b border-border/50 px-4 py-4 pr-12 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Megaphone className="h-5 w-5 text-primary" />
            Nova mensagem no alto-falante
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
          {loadingQuota || !quota ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-muted/20 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando seus limites da semana…
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <p className="text-xs font-medium text-foreground">
                  Limites desta semana
                </p>
                <p className="text-[11px] text-muted-foreground">{quota.week_key}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <QuotaMeter
                  label="Total"
                  remaining={quota.total_remaining}
                  limit={quota.total_limit}
                  tone="neutral"
                />
                <QuotaMeter
                  label="Baixo"
                  remaining={quota.low_remaining}
                  limit={quota.low_limit}
                  tone="amber"
                />
                <QuotaMeter
                  label="Médio"
                  remaining={quota.medium_remaining}
                  limit={quota.medium_limit}
                  tone="blue"
                />
                <QuotaMeter
                  label="Máximo"
                  remaining={quota.high_remaining}
                  limit={quota.high_limit}
                  tone="green"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="gm-body">Mensagem</Label>
            <Textarea
              id="gm-body"
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 280))}
              placeholder="Procuro duo, divulgue um evento, convide para a sala…"
              className="min-h-[88px] resize-none sm:min-h-[110px]"
              maxLength={280}
            />
            <p className="text-right text-xs text-muted-foreground">
              {body.trim().length}/280
            </p>
          </div>

          <div className="space-y-2">
            <Label>Volume</Label>
            <RadioGroup
              value={level}
              onValueChange={(v) => setLevel(v as GlobalMessageLevel)}
              className="gap-2"
            >
              {(Object.keys(LEVEL_META) as GlobalMessageLevel[]).map((lvl) => {
                const meta = LEVEL_META[lvl];
                const disabled = !canUseLevel(lvl);
                const Icon = meta.icon;
                const remainingHint =
                  !quota
                    ? null
                    : lvl === "low"
                      ? `${quota.low_remaining} restante${quota.low_remaining === 1 ? "" : "s"}`
                      : lvl === "medium"
                        ? `${quota.medium_remaining} restante${quota.medium_remaining === 1 ? "" : "s"}`
                        : `${quota.high_remaining} restante${quota.high_remaining === 1 ? "" : "s"}`;

                return (
                  <label
                    key={lvl}
                    data-selected={level === lvl}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${meta.accent} ${
                      disabled ? "cursor-not-allowed opacity-45" : "hover:bg-muted/20"
                    }`}
                  >
                    <RadioGroupItem
                      value={lvl}
                      id={`gm-level-${lvl}`}
                      disabled={disabled}
                      className="mt-1"
                    />
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                      <Icon className="h-4 w-4 text-foreground/80" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {meta.label}
                        </p>
                        <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {meta.duration}
                        </span>
                        {remainingHint ? (
                          <span className="text-[10px] text-muted-foreground">
                            {remainingHint}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {disabled
                          ? "Sem cota disponível para este volume"
                          : meta.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border/50 bg-background/95 px-4 py-3 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !body.trim() || !canUseLevel(level)}
            className="bg-gradient-primary text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

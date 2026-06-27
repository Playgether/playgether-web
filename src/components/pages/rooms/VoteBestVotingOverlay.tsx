"use client";

import { roomEventPostAction } from "@/actions/roomEventsActions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { RoomEventSubmission } from "@/types/RoomEvents";
import { Check, Loader2, Sparkles, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

type AnonymizedSubmission = RoomEventSubmission & { label: string };

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function buildAnonymousList(submissions: RoomEventSubmission[]): AnonymizedSubmission[] {
  return [...submissions]
    .sort((a, b) => a.id - b.id)
    .map((s, index) => ({ ...s, label: `Criação ${index + 1}` }));
}

export function VoteBestVotingOverlay({
  open,
  onOpenChange,
  eventId,
  roundNumber,
  themeText,
  deadlineIso,
  tickToken,
  submissions,
  myUserId,
  myVoteSubmissionId,
  canVote,
  isOrganizer,
  onVoted,
  onError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  roundNumber: number;
  themeText: string | null;
  deadlineIso: string | null;
  tickToken: number;
  submissions: RoomEventSubmission[];
  myUserId?: number;
  myVoteSubmissionId?: number | null;
  canVote: boolean;
  isOrganizer: boolean;
  onVoted: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [pendingSubmissionId, setPendingSubmissionId] = useState<number | null>(null);
  const [localVoteId, setLocalVoteId] = useState<number | null>(myVoteSubmissionId ?? null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalVoteId(myVoteSubmissionId ?? null);
  }, [myVoteSubmissionId]);

  const anonymousSubs = useMemo(() => buildAnonymousList(submissions), [submissions]);
  const votedId = localVoteId ?? myVoteSubmissionId ?? null;

  const remainingSec = useMemo(() => {
    if (!deadlineIso) return null;
    void tickToken;
    const end = new Date(deadlineIso).getTime();
    return Math.max(0, Math.ceil((end - Date.now()) / 1000));
  }, [deadlineIso, tickToken]);

  const handleVote = useCallback(
    (submissionId: number, isOwn: boolean) => {
      if (isOwn || !canVote || isOrganizer || isPending) return;
      startTransition(async () => {
        setPendingSubmissionId(submissionId);
        const result = await roomEventPostAction(eventId, "vote", {
          submission: submissionId,
          round_number: roundNumber,
        });
        setPendingSubmissionId(null);
        if (result.ok) {
          setLocalVoteId(submissionId);
          await onVoted();
        } else {
          onError(result.error ?? "Não foi possível registrar o voto.");
        }
      });
    },
    [canVote, eventId, isOrganizer, isPending, onError, onVoted, roundNumber]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-background px-5 py-4 pr-12">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              <DialogTitle className="text-lg">Vote no Melhor</DialogTitle>
            </div>
            <DialogDescription asChild>
              <div className="space-y-2">
                {themeText ? (
                  <p className="rounded-xl border border-primary/25 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground whitespace-pre-wrap">
                    {themeText}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  {isOrganizer
                    ? "Como organizador, conduza a rodada — você não vota."
                    : votedId
                      ? "Seu voto foi registrado. Você pode trocar clicando em outra criação."
                      : "Escolha a melhor criação. Voto obrigatório — quem não votar é eliminado."}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          {remainingSec != null ? (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-background/80 px-3 py-2">
              <Timer className="h-4 w-4 text-primary" aria-hidden />
              <span className="font-mono text-xl font-bold tabular-nums">{formatMmSs(remainingSec)}</span>
              <span className="text-xs text-muted-foreground">restantes</span>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {anonymousSubs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma criação nesta rodada.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {anonymousSubs.map((s) => {
                const isOwn = Boolean(myUserId && s.author === myUserId);
                const isSelected = votedId === s.id;
                const isLoading = pendingSubmissionId === s.id;

                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      disabled={isOwn || !canVote || isOrganizer || isPending}
                      onClick={() => handleVote(s.id, isOwn)}
                      className={cn(
                        "group relative flex h-full w-full flex-col rounded-2xl border p-4 text-left transition-all",
                        isOwn && "cursor-not-allowed border-border/50 bg-muted/20 opacity-70",
                        !isOwn &&
                          canVote &&
                          !isOrganizer &&
                          "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-md",
                        isSelected &&
                          "border-primary bg-primary/10 ring-2 ring-primary/30 hover:border-primary hover:bg-primary/10",
                        (isPending && !isLoading) || (!canVote && !isOwn) ? "pointer-events-none" : ""
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {s.label}
                        </span>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            <Check className="h-3 w-3" />
                            Seu voto
                          </span>
                        ) : isOwn ? (
                          <span className="text-[10px] font-medium text-muted-foreground">Sua criação</span>
                        ) : null}
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-foreground whitespace-pre-wrap">{s.content}</p>
                      {!isOwn && canVote && !isOrganizer && !isSelected ? (
                        <span className="mt-3 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                          Votar nesta
                        </span>
                      ) : null}
                      {isLoading ? (
                        <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border/60 bg-muted/10 px-5 py-3">
          <Button type="button" variant="secondary" className="w-full" onClick={() => onOpenChange(false)}>
            {votedId || isOrganizer ? "Fechar" : "Minimizar (vote antes do tempo acabar)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

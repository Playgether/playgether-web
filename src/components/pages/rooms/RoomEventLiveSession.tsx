"use client";

import { roomEventPostAction } from "@/actions/roomEventsActions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuthContext } from "@/context/AuthContext";
import { useRoomEventSession } from "@/context/RoomEventSessionContext";
import { useRoomEventSocket } from "@/hooks/useRoomEventSocket";
import { cn } from "@/lib/utils";
import { ChatRoom } from "@/types/ChatRoom";
import type { RoomEventFinalScore, RoomEventSubmission } from "@/types/RoomEvents";
import { Loader2, LogOut, Medal, Radio, Send, Timer, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

const PHASE_PT: Record<string, string> = {
  recruitment: "Recrutamento",
  host_setup: "Organizador preparando",
  vote_creation: "Criação individual",
  vote_reveal: "Criações reveladas",
  vote_voting: "Votação",
  quiz_main: "Quiz",
  quiz_finals: "Finais (2 jogadores)",
  button_play: "Button quiz",
  button_answering: "Button quiz — respostas",
  button_gabarito: "Button quiz — gabarito",
  finished: "Encerrado",
};

const EVENT_PT: Record<string, string> = {
  vote_best: "Vote no Melhor",
  quiz_elimination: "Quiz eliminatório",
  button_quiz: "Button Quiz",
};

function rtHas(rt: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(rt, key);
}

function pickGamePhase(rt: Record<string, unknown>, api?: string): string {
  if (rtHas(rt, "game_phase") && rt.game_phase != null && String(rt.game_phase).length > 0) {
    return String(rt.game_phase);
  }
  return String(api ?? "");
}

function pickNullableClaimedBy(
  rt: Record<string, unknown>,
  api: number | null | undefined
): number | null {
  if (rtHas(rt, "button_claimed_by")) {
    const v = rt.button_claimed_by;
    if (v === null || v === undefined) return null;
    return Number(v);
  }
  return api ?? null;
}

function pickOptionalIso(
  rt: Record<string, unknown>,
  key: string,
  api?: string | null
): string | null | undefined {
  if (rtHas(rt, key)) return (rt[key] as string) ?? null;
  return api;
}

function pickClaimerHasAnswered(rt: Record<string, unknown>, api?: boolean): boolean {
  if (rtHas(rt, "button_claimer_has_answered")) return Boolean(rt.button_claimer_has_answered);
  return Boolean(api);
}

function pickLastQuestion(rt: Record<string, unknown>, fallback: boolean): boolean {
  if (rtHas(rt, "is_last_question")) return Boolean(rt.is_last_question);
  return fallback;
}

function pickGabaritoAnswerCorrect(rt: Record<string, unknown>, api?: boolean): boolean {
  if (rtHas(rt, "button_gabarito_answer_correct")) return Boolean(rt.button_gabarito_answer_correct);
  return Boolean(api);
}

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function RoomEventLiveSession({ room: _room }: { room: ChatRoom }) {
  void _room;
  const { user } = useAuthContext();
  const { activeEvent, refreshActiveEvent, isOrganizer, myParticipation, dismissEventResults } =
    useRoomEventSession();
  const {
    connected,
    state: socketState,
    eventMessages,
    presence,
    socketError,
    sendMessage: sendEventSocketMessage,
    claimButton,
  } = useRoomEventSocket(activeEvent?.id ?? null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatText, setChatText] = useState("");
  const [isPending, startTransition] = useTransition();

  const [themeText, setThemeText] = useState("");
  const [themeTime, setThemeTime] = useState(60);
  const [qText, setQText] = useState("");
  const [qAnswer, setQAnswer] = useState("");
  const [qFinal, setQFinal] = useState(false);
  const [creationText, setCreationText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [eliminateId, setEliminateId] = useState("");

  const [bqGabarito, setBqGabarito] = useState("");
  const [bqPergunta, setBqPergunta] = useState("");
  const [bqAnswerText, setBqAnswerText] = useState("");
  const [tickToken, setTickToken] = useState(0);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);

  const rt = (socketState ?? {}) as Record<string, unknown>;
  const gamePhase = pickGamePhase(rt, activeEvent?.game_phase);
  const deadlineIso =
    pickOptionalIso(rt, "current_question_deadline_at", activeEvent?.current_question_deadline_at) ??
    activeEvent?.current_question_deadline_at;
  const buttonUnlock =
    pickOptionalIso(rt, "button_unlock_at", activeEvent?.button_unlock_at) ?? activeEvent?.button_unlock_at;
  const claimedBy = pickNullableClaimedBy(rt, activeEvent?.button_claimed_by);
  const buttonAnswerDeadline =
    pickOptionalIso(rt, "button_answer_deadline_at", activeEvent?.button_answer_deadline_at) ??
    activeEvent?.button_answer_deadline_at;
  const claimerHasAnswered = pickClaimerHasAnswered(rt, activeEvent?.button_claimer_has_answered);
  const isLastQuestion = pickLastQuestion(
    rt,
    Boolean(
      activeEvent?.event_type === "button_quiz" &&
        gamePhase === "button_answering" &&
        (activeEvent?.current_round ?? 0) >= (activeEvent?.rounds_total ?? 0)
    )
  );
  const gabaritoMatchesKey = pickGabaritoAnswerCorrect(rt, activeEvent?.button_gabarito_answer_correct);
  const buttonQuizNaturalEnd = Boolean(
    activeEvent?.event_type === "button_quiz" &&
      (activeEvent?.current_round ?? 0) > (activeEvent?.rounds_total ?? 0) &&
      gamePhase === "button_play"
  );
  const useEarlyFinalizeScoring = activeEvent?.event_type === "button_quiz" && !buttonQuizNaturalEnd;
  const liveQuestionText =
    (rtHas(rt, "current_question_text") ? (rt.current_question_text as string | undefined) : undefined) ??
    activeEvent?.questions?.find(
      (q) =>
        q.round_number === (activeEvent?.current_round ?? 0) &&
        q.order === (activeEvent?.current_question_order ?? 0)
    )?.text;

  const submissions = activeEvent?.submissions ?? [];
  const canPlay = Boolean(
    myParticipation?.participation_confirmed &&
      !myParticipation.invitation_declined &&
      myParticipation.is_active_player &&
      !myParticipation.is_eliminated
  );

  const authorName = useMemo(() => {
    const m = new Map<number, string>();
    activeEvent?.participants?.forEach((p) => m.set(p.user, p.username ?? `#${p.user}`));
    return (uid: number) => m.get(uid) ?? `#${uid}`;
  }, [activeEvent?.participants]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventMessages.length]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "button_quiz") return;
    if (gamePhase !== "button_answering") return;
    const id = window.setInterval(() => setTickToken((x) => x + 1), 250);
    return () => window.clearInterval(id);
  }, [activeEvent?.id, activeEvent?.event_type, gamePhase]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "button_quiz") return;
    if (gamePhase !== "button_answering") return;
    const dl =
      pickOptionalIso(rt, "button_answer_deadline_at", activeEvent.button_answer_deadline_at) ??
      activeEvent.button_answer_deadline_at;
    const cl = pickNullableClaimedBy(rt, activeEvent.button_claimed_by);
    if (!cl || !dl) return;
    let cancelled = false;
    const fire = async () => {
      if (cancelled) return;
      await roomEventPostAction(activeEvent.id, "button-process-ticks");
      await refreshActiveEvent();
    };
    const id = window.setInterval(fire, 2000);
    void fire();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [
    activeEvent?.id,
    activeEvent?.event_type,
    gamePhase,
    rt.button_answer_deadline_at,
    rt.button_claimed_by,
    activeEvent?.button_answer_deadline_at,
    activeEvent?.button_claimed_by,
    refreshActiveEvent,
  ]);

  if (!activeEvent) return null;

  if (activeEvent.status === "finished") {
    const scores = [...(activeEvent.final_scores ?? [])].sort(
      (a: RoomEventFinalScore, b: RoomEventFinalScore) => (a.placement ?? 999) - (b.placement ?? 999)
    );
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-1 py-2">
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Pontuação</h3>
              <p className="text-xs text-muted-foreground">{activeEvent.title}</p>
            </div>
          </div>
          {scores.length > 0 ? (
            <ol className="space-y-2">
              {scores.map((row, idx) => (
                <li
                  key={row.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/80 px-3 py-2.5"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold tabular-nums">
                        {row.placement ?? idx + 1}
                      </span>
                      {idx === 0 ? <Medal className="h-4 w-4 shrink-0 text-amber-500" /> : null}
                      <span className="truncate font-medium text-foreground">{row.username ?? `#${row.user}`}</span>
                    </div>
                    {(() => {
                      const parts = [
                        row.points_participation != null && row.points_participation !== 0
                          ? `Participação ${row.points_participation >= 0 ? "+" : ""}${row.points_participation}`
                          : "",
                        row.points_question_correct != null && row.points_question_correct !== 0
                          ? `Acertos +${row.points_question_correct}`
                          : "",
                        row.points_question_wrong != null && row.points_question_wrong !== 0
                          ? `Erros ${row.points_question_wrong}`
                          : "",
                        row.points_votes != null && row.points_votes !== 0
                          ? `Votos ${row.points_votes >= 0 ? "+" : ""}${row.points_votes}`
                          : "",
                      ].filter(Boolean);
                      return parts.length > 0 ? (
                        <p className="pl-10 text-[11px] leading-snug text-muted-foreground">{parts.join(" · ")}</p>
                      ) : null;
                    })()}
                  </div>
                  <span className="shrink-0 self-start text-sm font-bold tabular-nums text-primary md:self-center">
                    {row.total} pts
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
              Nenhum ponto de evento foi adicionado.
            </p>
          )}
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full rounded-xl font-semibold shadow-md"
          onClick={() => dismissEventResults()}
        >
          Voltar ao chat da sala
        </Button>
      </div>
    );
  }

  const run = (action: string, body?: Record<string, unknown>) => {
    startTransition(async () => {
      await roomEventPostAction(activeEvent.id, action, body);
      await refreshActiveEvent();
    });
  };

  const waitingClaimerAnswer =
    activeEvent.event_type === "button_quiz" &&
    gamePhase === "button_answering" &&
    claimedBy != null &&
    !claimerHasAnswered;

  const imClaimerMustAnswerFirst =
    Boolean(waitingClaimerAnswer && user?.user_id === claimedBy);

  const othersFrozenWhileClaimerAnswers =
    Boolean(waitingClaimerAnswer && !isOrganizer && user?.user_id !== claimedBy);

  const mayUseChat = isOrganizer || canPlay;

  const chatInputDisabled =
    !mayUseChat || othersFrozenWhileClaimerAnswers || imClaimerMustAnswerFirst;

  const chatPlaceholder = !mayUseChat
    ? "Apenas participantes ativos ou o organizador enviam mensagem"
    : othersFrozenWhileClaimerAnswers
      ? "Aguarde: outro participante está respondendo…"
      : imClaimerMustAnswerFirst
        ? "Envie sua resposta antes de usar o chat…"
        : "Mensagem do evento…";

  const onSendChat = () => {
    const t = chatText.trim();
    if (!t) return;
    sendEventSocketMessage(t);
    setChatText("");
  };

  const sessionEligible =
    presence?.sessionEligibleTotal ??
    activeEvent.participants?.filter((p) => p.participation_confirmed && !p.left_early).length ??
    0;
  const sessionLive = presence?.sessionLiveCount;

  const buttonRoundLabel =
    activeEvent.event_type === "button_quiz"
      ? activeEvent.current_round > activeEvent.rounds_total && gamePhase === "button_play"
        ? "Todas as perguntas concluídas"
        : `Pergunta ${Math.min(activeEvent.current_round, activeEvent.rounds_total)} de ${activeEvent.rounds_total}`
      : null;

  const showLiveQuestionBanner =
    activeEvent.event_type === "button_quiz" &&
    (gamePhase === "button_answering" || gamePhase === "button_gabarito") &&
    liveQuestionText;

  const showLeaveEvent =
    activeEvent.status === "running" && !isOrganizer && myParticipation && !myParticipation.left_early;

  const confirmLeaveEvent = () => {
    setLeaveDialogOpen(false);
    startTransition(async () => {
      await roomEventPostAction(activeEvent.id, "leave");
      await refreshActiveEvent();
    });
  };

  return (
    <>
    <div className="flex h-full w-full min-h-[min(60dvh,100%)] flex-col gap-3 overflow-x-hidden overflow-y-auto md:max-h-full md:min-h-0 md:overflow-hidden md:flex-row">
      <div className="flex min-h-[min(50dvh,100%)] min-w-0 flex-1 flex-col rounded-2xl border border-border/60 bg-card/50 md:min-h-0">
        <header className="shrink-0 border-b border-border/50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold text-foreground">{activeEvent.title}</h2>
              <p className="text-xs text-muted-foreground">
                {EVENT_PT[activeEvent.event_type] ?? activeEvent.event_type} · {PHASE_PT[gamePhase] ?? gamePhase}
              </p>
              {buttonRoundLabel ? (
                <p className="mt-1 text-xs font-semibold text-primary">{buttonRoundLabel}</p>
              ) : null}
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              {showLeaveEvent ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={isPending}
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sair do evento
                </Button>
              ) : null}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                  connected ? "border-neon-green/30 text-neon-green" : "border-border text-muted-foreground"
                )}
              >
                <Radio className="h-3 w-3" />
                {connected ? "Ao vivo" : "Conectando…"}
              </span>
            </div>
          </div>
          {isLastQuestion && gamePhase === "button_answering" ? (
            <p className="mt-2 rounded-lg bg-amber-500/15 px-2 py-1 text-center text-xs font-bold text-amber-700 dark:text-amber-400">
              Última pergunta do evento
            </p>
          ) : null}
          {showLiveQuestionBanner ? (
            <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-primary">Pergunta da rodada</p>
              <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{liveQuestionText}</p>
            </div>
          ) : null}
          {deadlineIso && gamePhase === "button_answering" && activeEvent.event_type !== "button_quiz" ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Prazo para respostas: {new Date(deadlineIso).toLocaleString()}
            </p>
          ) : null}
          {myParticipation?.is_eliminated ? (
            <p className="mt-2 rounded-lg bg-destructive/10 px-2 py-1 text-xs text-destructive">Você foi eliminado.</p>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {eventMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[92%] rounded-2xl px-3 py-2 text-sm",
                msg.is_system ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-foreground"
              )}
            >
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                {msg.username ?? "Sistema"}
              </p>
              <p className="whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <footer className="shrink-0 border-t border-border/50 p-3">
          <div className="flex gap-2">
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder={chatPlaceholder}
              disabled={chatInputDisabled}
              className="min-w-0 flex-1 rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onSendChat())}
            />
            <Button type="button" size="icon" variant="secondary" disabled={chatInputDisabled} onClick={onSendChat}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </footer>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 pb-4 md:w-[min(100%,380px)] md:max-w-[380px] md:overflow-y-auto md:pb-0">
        {activeEvent.event_type === "button_quiz" ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
              Participantes
              <span className="ml-auto rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold normal-case text-foreground tabular-nums">
                {activeEvent.participants?.filter((p) => p.participation_confirmed && !p.left_early).length ?? 0}
              </span>
            </p>
            <p className="mb-2 text-[10px] leading-snug text-muted-foreground">
              Na sessão ao vivo:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {sessionLive != null && sessionEligible > 0
                  ? `${sessionLive}/${sessionEligible}`
                  : sessionEligible > 0
                    ? `0/${sessionEligible}`
                    : "—"}
              </span>
              {sessionLive != null && sessionEligible > 0 && sessionLive < sessionEligible ? (
                <span className="mt-0.5 block text-amber-700 dark:text-amber-400">
                  Parte do grupo ainda não entrou nesta tela.
                </span>
              ) : null}
            </p>
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/10 p-1.5">
              {(activeEvent.participants ?? [])
                .filter((p) => p.participation_confirmed && !p.left_early)
                .map((p) => (
                  <li
                    key={p.id}
                    className={cn(
                      "truncate rounded-md px-2 py-1 text-xs",
                      p.is_eliminated ? "text-muted-foreground line-through decoration-muted-foreground/80" : "text-foreground"
                    )}
                  >
                    <span className="font-medium">{p.username ?? authorName(p.user)}</span>
                    {p.is_eliminated ? (
                      <span className="ml-1 text-[10px] text-destructive">eliminado</span>
                    ) : !p.is_active_player ? (
                      <span className="ml-1 text-[10px] text-muted-foreground">espectador</span>
                    ) : null}
                  </li>
                ))}
            </ul>
          </div>
        ) : null}

        {activeEvent.event_type === "vote_best" && gamePhase === "vote_creation" && canPlay ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Sua criação</p>
            <textarea
              value={creationText}
              onChange={(e) => setCreationText(e.target.value)}
              className="mb-2 min-h-[88px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              placeholder="Escreva conforme o tema do organizador…"
            />
            <Button
              className="w-full"
              disabled={!creationText.trim() || isPending}
              onClick={() => {
                run("submit", {
                  content: creationText.trim(),
                  round_number: activeEvent.current_round,
                });
                setCreationText("");
              }}
            >
              Enviar criação
            </Button>
          </div>
        ) : null}

        {activeEvent.event_type === "vote_best" && gamePhase === "vote_voting" && canPlay ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Votar (obrigatório)</p>
            <ul className="max-h-48 space-y-2 overflow-y-auto">
              {submissions.map((s: RoomEventSubmission) => (
                <li key={s.id} className="rounded-xl border border-border/50 bg-muted/20 p-2">
                  <p className="text-xs font-medium text-foreground">{authorName(s.author)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-3">{s.content}</p>
                  {s.author !== user?.user_id ? (
                    <Button
                      size="sm"
                      className="mt-2 w-full"
                      variant="secondary"
                      disabled={isPending}
                      onClick={() => run("vote", { submission: s.id, round_number: s.round_number })}
                    >
                      Votar nesta
                    </Button>
                  ) : (
                    <p className="mt-1 text-[10px] text-muted-foreground">Sua criação — não pode votar em si.</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {activeEvent.event_type === "button_quiz" && !isOrganizer && gamePhase === "button_answering" && canPlay ? (
          <div className="space-y-3 rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">Responder</p>
            {(() => {
              void tickToken;
              const unlockMs = buttonUnlock ? new Date(buttonUnlock).getTime() : 0;
              const now = Date.now();
              const prepSeconds = buttonUnlock && now < unlockMs ? Math.max(1, Math.ceil((unlockMs - now) / 1000)) : 0;
              const unlockReached = !buttonUnlock || now >= unlockMs;
              const imClaimer = claimedBy === user?.user_id;
              const claimerLabel = claimedBy ? authorName(claimedBy) : "";

              if (imClaimer && !claimerHasAnswered) {
                return (
                  <div className="pointer-events-none flex w-full cursor-default select-none items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white">
                    Você foi o primeiro a clicar
                  </div>
                );
              }

              if (claimedBy && !imClaimer) {
                return (
                  <Button className="h-auto min-h-11 w-full whitespace-normal py-2.5 text-center" disabled type="button" variant="secondary">
                    {claimerLabel} está respondendo à pergunta…
                  </Button>
                );
              }

              return (
                <Button
                  className="w-full"
                  variant="secondary"
                  disabled={!unlockReached || Boolean(claimedBy) || isPending}
                  type="button"
                  onClick={() => claimButton()}
                >
                  {!unlockReached && prepSeconds > 0 ? `Responder (${prepSeconds}s)` : "Responder"}
                </Button>
              );
            })()}
            {socketError ? <p className="text-center text-xs text-destructive">{socketError}</p> : null}
            {claimedBy === user?.user_id && !claimerHasAnswered ? (
              <>
                {buttonAnswerDeadline ? (
                  <div className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-primary/35 bg-gradient-to-br from-primary/15 to-card px-4 py-3 shadow-inner">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-primary">
                      <Timer className="h-4 w-4" aria-hidden />
                      Tempo para responder
                    </div>
                    <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                      {(() => {
                        void tickToken;
                        const end = new Date(buttonAnswerDeadline).getTime();
                        const sec = Math.max(0, Math.ceil((end - Date.now()) / 1000));
                        return formatMmSs(sec);
                      })()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Você tem um minuto para responder ou será eliminado.
                    </p>
                  </div>
                ) : null}
                <textarea
                  value={bqAnswerText}
                  onChange={(e) => setBqAnswerText(e.target.value)}
                  className="min-h-[72px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
                  placeholder="Sua resposta (aparece no chat do evento)"
                />
                <Button
                  className="w-full"
                  disabled={!bqAnswerText.trim() || isPending}
                  type="button"
                  onClick={() => {
                    run("button-submit-answer", { answer_text: bqAnswerText.trim() });
                    setBqAnswerText("");
                  }}
                >
                  Enviar resposta
                </Button>
              </>
            ) : null}
          </div>
        ) : null}

        {activeEvent.event_type === "button_quiz" &&
        !isOrganizer &&
        gamePhase === "button_gabarito" &&
        canPlay &&
        user?.user_id === claimedBy ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="text-sm text-muted-foreground">
              Sua resposta foi enviada. O gabarito só aparece no chat quando a resposta está certa. Aguarde a decisão do
              organizador.
            </p>
          </div>
        ) : null}

        {activeEvent.event_type === "quiz_elimination" && canPlay ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3 space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">Resposta (quiz eliminatório)</p>
            <input
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
              placeholder="Sua resposta"
            />
            {gamePhase !== "quiz_finals" ? (
              <input
                value={eliminateId}
                onChange={(e) => setEliminateId(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
                placeholder="ID do usuário a eliminar (se acertar)"
              />
            ) : null}
            <Button
              className="w-full"
              disabled={!answerText.trim() || isPending}
              type="button"
              onClick={() => {
                const body: Record<string, unknown> = { answer_text: answerText.trim() };
                if (eliminateId) body.eliminate_user_id = Number(eliminateId);
                run("answer", body);
                setAnswerText("");
              }}
            >
              Enviar resposta
            </Button>
          </div>
        ) : null}

        {isOrganizer ? (
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3 space-y-3">
            <p className="text-xs font-bold uppercase text-primary">Organizador</p>

            {activeEvent.event_type === "vote_best" ? (
              <div className="space-y-2">
                <p className="text-[10px] text-muted-foreground">Tema / instrução (pergunta no sistema)</p>
                <textarea
                  value={themeText}
                  onChange={(e) => setThemeText(e.target.value)}
                  className="min-h-[64px] w-full rounded-lg border bg-background px-2 py-1 text-xs"
                  placeholder="Ex.: uma cantada de LoL…"
                />
                <label className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  Tempo criação (30–120s)
                  <input
                    type="number"
                    min={30}
                    max={120}
                    value={themeTime}
                    onChange={(e) => setThemeTime(Number(e.target.value))}
                    className="w-20 rounded border bg-background px-1"
                  />
                </label>
                <Button
                  size="sm"
                  className="w-full"
                  variant="secondary"
                  disabled={!themeText.trim()}
                  type="button"
                  onClick={() =>
                    run("questions", {
                      text: themeText.trim(),
                      round_number: activeEvent.current_round,
                      order: activeEvent.current_question_order,
                      time_limit_sec: themeTime,
                    })
                  }
                >
                  Salvar tema
                </Button>
                <Button size="sm" className="w-full" type="button" onClick={() => run("start-current-question")}>
                  Iniciar tempo de criação
                </Button>
                <Button size="sm" className="w-full" variant="outline" type="button" onClick={() => run("reveal-creations")}>
                  Revelar criações
                </Button>
                <Button size="sm" className="w-full" type="button" onClick={() => run("start-voting")}>
                  Iniciar votação
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  variant="destructive"
                  type="button"
                  onClick={() => run("close-voting-round")}
                >
                  Encerrar rodada de votos
                </Button>
              </div>
            ) : null}

            {activeEvent.event_type === "button_quiz" ? (
              <div className="space-y-3 border-t border-border/40 pt-2">
                <p className="text-[10px] font-semibold text-muted-foreground">
                  Button quiz — {activeEvent.rounds_total} rodada(s) definidas na criação do evento
                </p>
                {gamePhase === "button_play" && activeEvent.current_round <= activeEvent.rounds_total ? (
                  <>
                    <label className="block text-[10px] font-medium text-muted-foreground">Pergunta (vai ao chat)</label>
                    <textarea
                      value={bqPergunta}
                      onChange={(e) => setBqPergunta(e.target.value)}
                      className="min-h-[80px] w-full rounded-lg border bg-background px-2 py-2 text-sm"
                      placeholder="Texto da pergunta para todos verem"
                    />
                    <label className="block text-[10px] font-medium text-muted-foreground">Gabarito</label>
                    <input
                      value={bqGabarito}
                      onChange={(e) => setBqGabarito(e.target.value)}
                      className="w-full rounded-lg border bg-background px-2 py-2 text-sm"
                      placeholder="Resposta correta exata"
                    />
                    <Button
                      className="w-full"
                      type="button"
                      disabled={!bqGabarito.trim() || !bqPergunta.trim() || isPending}
                      onClick={() => {
                        run("button-publish-question", {
                          text: bqPergunta.trim(),
                          answer_key: bqGabarito.trim(),
                        });
                        setBqPergunta("");
                        setBqGabarito("");
                      }}
                    >
                      Fazer pergunta
                    </Button>
                  </>
                ) : null}

                {gamePhase === "button_gabarito" ? (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground">
                      Confira a resposta no chat. O gabarito só foi revelado automaticamente se bateu com o cadastrado.
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      type="button"
                      disabled={isPending}
                      onClick={() => run("button-organizer-decision", { correct: true })}
                    >
                      Acertou — avançar rodada
                    </Button>
                    {!gabaritoMatchesKey ? (
                      <>
                        <p className="text-[10px] font-medium text-muted-foreground">Se errou, refaça a rodada:</p>
                        <Button
                          size="sm"
                          className="w-full"
                          variant="secondary"
                          type="button"
                          disabled={isPending}
                          onClick={() => run("button-organizer-decision", { correct: false, redo_mode: "same" })}
                        >
                          Repetir a mesma pergunta
                        </Button>
                        <Button
                          size="sm"
                          className="w-full"
                          variant="outline"
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            run("button-organizer-decision", { correct: false, redo_mode: "new_question" })
                          }
                        >
                          Inserir nova pergunta
                        </Button>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {activeEvent.event_type === "quiz_elimination" ? (
              <div className="space-y-2 border-t border-border/40 pt-2">
                <p className="text-[10px] font-semibold text-muted-foreground">Nova pergunta (quiz eliminatório)</p>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="min-h-[56px] w-full rounded-lg border bg-background px-2 py-1 text-xs"
                />
                <input
                  value={qAnswer}
                  onChange={(e) => setQAnswer(e.target.value)}
                  className="w-full rounded-lg border bg-background px-2 py-1 text-xs"
                  placeholder="Resposta correta (gabarito)"
                />
                <label className="flex items-center gap-2 text-[10px]">
                  <input type="checkbox" checked={qFinal} onChange={(e) => setQFinal(e.target.checked)} />
                  Pergunta final (10 pts)
                </label>
                <Button
                  size="sm"
                  className="w-full"
                  variant="secondary"
                  disabled={!qText.trim()}
                  type="button"
                  onClick={() => {
                    run("questions", {
                      text: qText.trim(),
                      answer_key: qAnswer.trim(),
                      is_final: qFinal,
                      round_number: activeEvent.current_round,
                      order: activeEvent.current_question_order,
                      time_limit_sec: activeEvent.answer_time_sec,
                    });
                    setQText("");
                    setQAnswer("");
                    setQFinal(false);
                  }}
                >
                  Adicionar pergunta
                </Button>
                <Button size="sm" className="w-full" type="button" onClick={() => run("start-current-question")}>
                  Iniciar pergunta atual
                </Button>
                <Button size="sm" className="w-full" variant="outline" type="button" onClick={() => run("advance-question")}>
                  Avançar pergunta / rodada
                </Button>
              </div>
            ) : null}

            <Button
              size="sm"
              className="w-full"
              variant="destructive"
              type="button"
              onClick={() => setFinalizeDialogOpen(true)}
            >
              Finalizar evento e Pontuação
            </Button>
          </div>
        ) : null}

        {isPending ? (
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Atualizando…
          </p>
        ) : null}
      </aside>
    </div>

    <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair do evento?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será eliminado e não receberá pontos deste evento. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={confirmLeaveEvent}
          >
            Sair do evento
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={finalizeDialogOpen} onOpenChange={setFinalizeDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finalizar evento?</AlertDialogTitle>
          <AlertDialogDescription>
            O evento será encerrado e a pontuação será calculada com base nas regras do modo. Confirme apenas quando
            todos os participantes concluíram.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              setFinalizeDialogOpen(false);
              run("finalize", {
                force_finalize: true,
                ...(useEarlyFinalizeScoring ? { early_finalize: true } : {}),
              });
            }}
          >
            Finalizar e pontuar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

"use client";

import { createRoomEvent, roomEventPostAction } from "@/actions/roomEventsActions";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomEventSession } from "@/context/RoomEventSessionContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import type { RoomEventParticipant } from "@/types/RoomEvents";
import { RoomEventType } from "@/types/RoomEvents";
import { Clock, Gamepad2, Loader2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

const TYPE_LABEL: Record<RoomEventType, string> = {
  vote_best: "Vote no Melhor",
  quiz_elimination: "Quiz eliminatório",
  button_quiz: "Button Quiz",
};

/** Mesmo texto conceitual enviado ao chat ao iniciar (versão curta na UI). */
const EVENT_TYPE_HELP: Record<RoomEventType, string> = {
  vote_best: "Crie algo por rodada, vote no melhor e dispute pontos. Votação obrigatória.",
  quiz_elimination: "Perguntas com eliminação: quem erra sai até restarem os finalistas.",
  button_quiz: "Rodadas rápidas de perguntas; dispute pelo botão conforme as rodadas.",
};

function formatMmSs(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function guestInviteStatus(p: RoomEventParticipant | undefined): "pending" | "in" | "out" {
  if (!p) return "pending";
  if (p.invitation_declined) return "out";
  if (p.participation_confirmed) return "in";
  return "pending";
}

function statusLabel(status: ReturnType<typeof guestInviteStatus>): string {
  switch (status) {
    case "in":
      return "Vai participar";
    case "out":
      return "Recusou";
    default:
      return "Aguardando resposta";
  }
}

export default function RoomEventsPanel({ room }: { room: ChatRoom }) {
  const { user } = useAuthContext();
  const { can } = useRoomPermissions();
  const canCreateGames = can("games.create");
  const { refreshActiveEvent, activeEvent, isOrganizer, myParticipation } = useRoomEventSession();
  const { onlineUsers } = useChatHandlerContext();
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<RoomEventType>("vote_best");
  const [rounds, setRounds] = useState(5);
  const [buttonAnswerSec, setButtonAnswerSec] = useState(60);
  const [voteBestRounds, setVoteBestRounds] = useState(3);
  const [voteBestCreationSec, setVoteBestCreationSec] = useState(60);
  const [voteBestVoteSec, setVoteBestVoteSec] = useState(60);
  const [message, setMessage] = useState<string | null>(null);
  const [recruitmentStartError, setRecruitmentStartError] = useState<string | null>(null);
  const [insufficientParticipantsMessage, setInsufficientParticipantsMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [nowTick, setNowTick] = useState(() => Date.now());

  const hasBlockingEvent = Boolean(
    activeEvent && (activeEvent.status === "running" || activeEvent.status === "recruiting")
  );
  const showDuplicateRoomBanner = Boolean(
    hasBlockingEvent && !(isOrganizer && activeEvent?.status === "recruiting")
  );
  const creatorId = activeEvent?.created_by;
  const participants = activeEvent?.participants;

  const guestsOnline = useMemo(() => {
    if (creatorId == null) return [];
    return onlineUsers.filter((u) => u.id !== creatorId);
  }, [onlineUsers, creatorId]);

  const onlineGuestIds = useMemo(() => new Set(guestsOnline.map((u) => u.id)), [guestsOnline]);

  const offlineRespondents = useMemo(() => {
    if (!participants?.length || creatorId == null) return [];
    return participants.filter((p) => p.user !== creatorId && !onlineGuestIds.has(p.user));
  }, [participants, creatorId, onlineGuestIds]);

  const secondsLeft = useMemo(() => {
    if (!activeEvent?.recruitment_deadline_at) return 0;
    const end = new Date(activeEvent.recruitment_deadline_at).getTime();
    return Math.max(0, Math.ceil((end - nowTick) / 1000));
  }, [activeEvent?.recruitment_deadline_at, nowTick]);

  useEffect(() => {
    void refreshActiveEvent();
  }, [refreshActiveEvent]);

  useEffect(() => {
    if (activeEvent?.status !== "recruiting" || !activeEvent.recruitment_deadline_at) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [activeEvent?.status, activeEvent?.recruitment_deadline_at]);

  useEffect(() => {
    const onSync = (ev: Event) => {
      const ce = ev as CustomEvent<{
        reason?: string;
        message?: string;
        organizer_user_id?: number;
      }>;
      const d = ce.detail;
      if (
        d?.reason === "event_cancelled" &&
        d.message &&
        user?.user_id != null &&
        d.organizer_user_id === user.user_id
      ) {
        setInsufficientParticipantsMessage(d.message);
      }
    };
    window.addEventListener("playgether:room-event-sync", onSync);
    return () => window.removeEventListener("playgether:room-event-sync", onSync);
  }, [user?.user_id]);

  useEffect(() => {
    if (activeEvent?.status === "recruiting") {
      setInsufficientParticipantsMessage(null);
    }
  }, [activeEvent?.id, activeEvent?.status]);

  const handleCreate = () => {
    if (!title.trim() || !canCreateGames) return;
    startTransition(async () => {
      setRecruitmentStartError(null);
      setInsufficientParticipantsMessage(null);
      const payload: Parameters<typeof createRoomEvent>[0] = {
        room: room.id,
        title: title.trim(),
        event_type: eventType,
      };
      if (eventType === "button_quiz") {
        payload.rounds_total = rounds;
        const sec = Math.min(120, Math.max(15, Math.round(buttonAnswerSec)));
        payload.answer_time_sec = sec;
      }
      if (eventType === "vote_best") {
        payload.rounds_total = Math.min(10, Math.max(1, Math.round(voteBestRounds)));
        payload.answer_time_sec = Math.min(120, Math.max(5, Math.round(voteBestCreationSec)));
        payload.vote_time_sec = Math.min(300, Math.max(30, Math.round(voteBestVoteSec)));
      }
      const result = await createRoomEvent(payload);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setTitle("");
      setMessage("Evento criado! Todos na sala receberam o convite.");
      await refreshActiveEvent();
    });
  };

  const canViewGames =
    canCreateGames ||
    Boolean(
      activeEvent &&
        (activeEvent.status === "running" ||
          activeEvent.status === "recruiting" ||
          activeEvent.status === "finished"),
    );

  if (!canViewGames) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-gradient-to-b from-muted/15 to-background p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Jogos</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Não há nenhum jogo acontecendo no momento.
        </p>
      </div>
    );
  }

  const recruitingHeader =
    activeEvent?.status === "recruiting" && activeEvent.title ? (
      <>
        <h2 className="text-xl font-bold tracking-tight">{activeEvent.title}</h2>
        <p className="text-sm text-muted-foreground">
          {EVENT_TYPE_HELP[(activeEvent.event_type as RoomEventType) ?? "vote_best"]}
        </p>
      </>
    ) : (
      <>
        <h2 className="text-xl font-bold tracking-tight">Criar jogo</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o modo e o nome. Quem estiver na sala recebe um convite; quem aceitar entra no jogo.
        </p>
      </>
    );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-gradient-to-b from-muted/15 to-background">
      <div className="mx-auto w-full max-w-lg space-y-6 p-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Gamepad2 className="h-7 w-7" />
          </div>
          {recruitingHeader}
        </div>

        {insufficientParticipantsMessage ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive"
          >
            {insufficientParticipantsMessage}
          </div>
        ) : null}

        {activeEvent?.status === "recruiting" && !isOrganizer && user?.user_id != null ? (
          <div className="rounded-xl border border-border/60 bg-card/90 px-4 py-4 shadow-sm">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Seu convite
            </p>
            {guestInviteStatus(myParticipation) === "pending" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await roomEventPostAction(activeEvent.id, "join");
                      if (!result.ok) {
                        setMessage(
                          typeof result.error === "string" ? result.error : "Não foi possível aceitar."
                        );
                        return;
                      }
                      setMessage(null);
                      await refreshActiveEvent();
                    });
                  }}
                >
                  Aceitar evento
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await roomEventPostAction(activeEvent.id, "reject-invite");
                      await refreshActiveEvent();
                    });
                  }}
                >
                  Recusar
                </Button>
              </div>
            ) : (
              <p className="text-center text-sm font-medium text-foreground">
                {guestInviteStatus(myParticipation) === "in"
                  ? "Você confirmou participação neste evento."
                  : "Você recusou o convite."}
              </p>
            )}
          </div>
        ) : null}

        {activeEvent?.status === "recruiting" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-xl border border-primary/35 bg-primary/5 px-4 py-4">
              <Clock className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tempo para responder ao convite
                </p>
                <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {formatMmSs(secondsLeft)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/80 px-4 py-3">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Na sala agora (exceto organizador)
              </p>
              {guestsOnline.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  Ninguém mais na sala no momento — aguardando entrada.
                </p>
              ) : (
                <ul className="space-y-2">
                  {guestsOnline.map((u) => {
                    const p = participants?.find((x) => x.user === u.id);
                    const st = guestInviteStatus(p);
                    return (
                      <li
                        key={u.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-sm"
                      >
                        <span className="truncate font-medium text-foreground">{u.fullname || u.username}</span>
                        <span
                          className={
                            st === "in"
                              ? "shrink-0 text-emerald-600 dark:text-emerald-400"
                              : st === "out"
                                ? "shrink-0 text-muted-foreground line-through"
                                : "shrink-0 text-amber-600 dark:text-amber-400"
                          }
                        >
                          {statusLabel(st)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {offlineRespondents.length > 0 ? (
              <div className="rounded-xl border border-border/50 bg-muted/15 px-4 py-3">
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fora da sala agora (já responderam)
                </p>
                <ul className="space-y-2">
                  {offlineRespondents.map((p) => {
                    const st = guestInviteStatus(p);
                    const name = p.username ?? `Usuário #${p.user}`;
                    return (
                      <li
                        key={p.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/30 px-3 py-2 text-sm"
                      >
                        <span className="truncate text-foreground">{name}</span>
                        <span
                          className={
                            st === "in"
                              ? "shrink-0 text-emerald-600 dark:text-emerald-400"
                              : st === "out"
                                ? "shrink-0 text-muted-foreground"
                                : "shrink-0 text-amber-600 dark:text-amber-400"
                          }
                        >
                          {statusLabel(st)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {showDuplicateRoomBanner ? (
          <div
            role="status"
            className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-left text-sm text-foreground shadow-sm"
          >
            <p className="font-semibold text-amber-900 dark:text-amber-200">Já existe um evento nesta sala</p>
            <p className="mt-1 text-muted-foreground">
              Só pode ocorrer <strong className="text-foreground">um evento por vez</strong>.{" "}
              {activeEvent!.status === "running"
                ? "Há um jogo em andamento — use o convite ou a tela do evento se você participa."
                : "Há recrutamento em curso — aceite o convite ou aguarde o início."}{" "}
              Outro organizador não pode criar um segundo evento até este ser encerrado ou cancelado.
            </p>
          </div>
        ) : null}

        {activeEvent?.status === "recruiting" ? (
          <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-foreground">
            <p className="text-center text-muted-foreground">
              Aceite o convite no popup, <strong className="text-foreground">nesta aba Jogos</strong> (botões
              abaixo) ou aguarde o tempo; o organizador pode iniciar antes se todos estiverem prontos.
            </p>
            {isOrganizer ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button
                  type="button"
                  variant="default"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                  onClick={() => {
                    startTransition(async () => {
                      setRecruitmentStartError(null);
                      const result = await roomEventPostAction(activeEvent.id, "early-begin-recruitment");
                      if (!result.ok) {
                        setRecruitmentStartError(
                          typeof result.error === "string" ? result.error : "Não foi possível iniciar o evento."
                        );
                        return;
                      }
                      await refreshActiveEvent();
                    });
                  }}
                >
                  Iniciar agora (todos prontos)
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                  onClick={() => {
                    startTransition(async () => {
                      await roomEventPostAction(activeEvent.id, "cancel-recruiting");
                      await refreshActiveEvent();
                    });
                  }}
                >
                  Cancelar evento
                </Button>
              </div>
            ) : null}
            {recruitmentStartError ? (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
                {recruitmentStartError}
              </p>
            ) : null}
          </div>
        ) : null}

        {!hasBlockingEvent ? (
          canCreateGames ? (
          <div className="space-y-4 rounded-2xl border border-border/60 bg-card/90 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Novo jogo
            </div>
            <div className="space-y-2">
              <label htmlFor="ev-title" className="text-xs font-medium text-muted-foreground">
                Nome do jogo
              </label>
              <input
                id="ev-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Noite das cantadas"
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ev-type" className="text-xs font-medium text-muted-foreground">
                Modo
              </label>
              <select
                id="ev-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value as RoomEventType)}
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
              >
                {(Object.keys(TYPE_LABEL) as RoomEventType[]).map((k) => (
                  <option key={k} value={k}>
                    {TYPE_LABEL[k]}
                  </option>
                ))}
              </select>
            </div>
            {eventType === "button_quiz" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="ev-rounds" className="text-xs font-medium text-muted-foreground">
                    Rodadas (3–10)
                  </label>
                  <input
                    id="ev-rounds"
                    type="number"
                    min={3}
                    max={10}
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ev-bq-answer-sec" className="text-xs font-medium text-muted-foreground">
                    Tempo para responder cada pergunta (15 s – 2 min)
                  </label>
                  <input
                    id="ev-bq-answer-sec"
                    type="number"
                    min={15}
                    max={120}
                    step={1}
                    value={buttonAnswerSec}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isNaN(n)) return;
                      setButtonAnswerSec(Math.min(120, Math.max(15, Math.round(n))));
                    }}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Valores fora de 15–120 não são aceitos pelo servidor.
                  </p>
                </div>
              </div>
            ) : null}
            {eventType === "vote_best" ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="ev-vb-rounds" className="text-xs font-medium text-muted-foreground">
                    Rodadas (1–10)
                  </label>
                  <input
                    id="ev-vb-rounds"
                    type="number"
                    min={1}
                    max={10}
                    value={voteBestRounds}
                    onChange={(e) => setVoteBestRounds(Number(e.target.value))}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ev-vb-creation-sec" className="text-xs font-medium text-muted-foreground">
                    Tempo padrão para criar (5 s – 2 min)
                  </label>
                  <input
                    id="ev-vb-creation-sec"
                    type="number"
                    min={5}
                    max={120}
                    value={voteBestCreationSec}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isNaN(n)) return;
                      setVoteBestCreationSec(Math.min(120, Math.max(5, Math.round(n))));
                    }}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    O organizador pode ajustar por tema (5 s a 2 min) a cada rodada.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="ev-vb-vote-sec" className="text-xs font-medium text-muted-foreground">
                    Tempo para votar (30 s – 5 min)
                  </label>
                  <input
                    id="ev-vb-vote-sec"
                    type="number"
                    min={30}
                    max={300}
                    value={voteBestVoteSec}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (Number.isNaN(n)) return;
                      setVoteBestVoteSec(Math.min(300, Math.max(30, Math.round(n))));
                    }}
                    className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm"
                  />
                </div>
              </div>
            ) : null}
            <Button className="w-full" disabled={!title.trim() || isPending} onClick={handleCreate}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Criar e convidar sala
            </Button>
          </div>
          ) : (
            <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
              Você não tem permissão para criar jogos nesta sala.
            </p>
          )
        ) : null}

        {message ? <p className="text-center text-xs text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}

"use client";

import { deleteRoomEventMessage, roomEventPostAction } from "@/actions/roomEventsActions";
import { RoomMessageActionsMenu } from "@/components/pages/rooms/RoomModerationMenus";
import { VoteBestVotingOverlay } from "@/components/pages/rooms/VoteBestVotingOverlay";
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
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { useRoomEventSession } from "@/context/RoomEventSessionContext";
import { useRoomEventSocket } from "@/hooks/useRoomEventSocket";
import { cn } from "@/lib/utils";
import { ChatRoom } from "@/types/ChatRoom";
import type { RoomEventFinalScore } from "@/types/RoomEvents";
import { Loader2, LogOut, Medal, Radio, Send, Sparkles, Timer, Trophy, Users } from "lucide-react";
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
  api: string | number | null | undefined
): string | null {
  if (rtHas(rt, "button_claimed_by")) {
    const v = rt.button_claimed_by;
    if (v === null || v === undefined || v === "") return null;
    return String(v);
  }
  if (api === null || api === undefined || api === "") return null;
  return String(api);
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

/** Rótulo legível para o tempo configurado no Button Quiz (15 s – 2 min). */
function formatAnswerWindowLabel(sec: number): string {
  const s = Math.max(15, Math.min(120, Math.round(Number.isFinite(sec) ? sec : 60)));
  if (s < 60) return `${s} segundos`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (r === 0) return m === 1 ? "1 minuto" : `${m} minutos`;
  return m === 1 ? `1 min e ${r} seg` : `${m} min e ${r} seg`;
}

function pickAnswerTimeSec(rt: Record<string, unknown>, api?: number): number {
  if (rtHas(rt, "answer_time_sec")) {
    const n = Number(rt.answer_time_sec);
    if (Number.isFinite(n)) return n;
  }
  return api ?? 60;
}

function pickUserIdList(
  rt: Record<string, unknown>,
  key: string,
  fallback: Array<string | number>
): string[] {
  if (rtHas(rt, key) && Array.isArray(rt[key])) {
    return (rt[key] as unknown[])
      .map((x) => String(x))
      .filter((s) => s.length > 0 && s !== "null" && s !== "undefined");
  }
  return fallback.map((x) => String(x)).filter((s) => s.length > 0);
}

export function RoomEventLiveSession({ room: _room }: { room: ChatRoom }) {
  const room = _room;
  const { user } = useAuthContext();
  const { muteNotice } = useRoomPermissions();
  const { activeEvent, refreshActiveEvent, isOrganizer, myParticipation, dismissEventResults } =
    useRoomEventSession();
  const {
    connected,
    state: socketState,
    notices,
    eventMessages,
    presence,
    socketError,
    sendMessage: sendEventSocketMessage,
    claimButton,
    removeEventMessage,
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
  const processedVoteTimeoutRef = useRef<string | null>(null);
  const processedQuizTimeoutRef = useRef<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  const [kickConfirm, setKickConfirm] = useState<{ user: string; label: string } | null>(null);
  const [eventKickNotice, setEventKickNotice] = useState<string | null>(null);
  const [autoFinishMessage, setAutoFinishMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [voteOverlayOpen, setVoteOverlayOpen] = useState(false);
  const lastVoteOverlayKeyRef = useRef<string | null>(null);
  const processedButtonTimeoutRef = useRef<string | null>(null);

  const rt = (socketState ?? {}) as Record<string, unknown>;
  const gamePhase = pickGamePhase(rt, activeEvent?.game_phase);
  const answerTimeSec = pickAnswerTimeSec(rt, activeEvent?.answer_time_sec);
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
  const tieBreakAuthorIds = activeEvent?.tie_break_author_ids ?? [];
  const roundSubmissions = useMemo(() => {
    if (!activeEvent) return [];
    const round = activeEvent.current_round ?? 1;
    const inRound = submissions.filter((s) => s.round_number === round);
    if (tieBreakAuthorIds.length > 0) {
      return inRound.filter((s) => tieBreakAuthorIds.includes(s.author));
    }
    return inRound;
  }, [submissions, activeEvent?.current_round, tieBreakAuthorIds, activeEvent]);

  const currentThemeText = useMemo(() => {
    if (!activeEvent) return null;
    return (
      activeEvent.questions?.find(
        (q) =>
          q.round_number === (activeEvent.current_round ?? 0) &&
          q.order === (activeEvent.current_question_order ?? 1)
      )?.text ??
      liveQuestionText ??
      null
    );
  }, [activeEvent, liveQuestionText]);
  const canPlay = Boolean(
    myParticipation?.participation_confirmed &&
      !myParticipation.invitation_declined &&
      myParticipation.is_active_player &&
      !myParticipation.is_eliminated
  );

  const voteExpectedPlayers = useMemo(() => {
    if (!activeEvent) return [];
    return (activeEvent.participants ?? []).filter(
      (p) =>
        p.participation_confirmed &&
        !p.left_early &&
        p.is_active_player &&
        !p.is_eliminated &&
        p.user !== activeEvent.created_by
    );
  }, [activeEvent]);

  const submittedAuthorIds = useMemo(() => {
    const fromSubmissions = roundSubmissions.map((s) => s.author);
    return pickUserIdList(rt, "creation_submitted_user_ids", fromSubmissions);
  }, [rt, roundSubmissions]);

  const pendingAuthorIds = useMemo(() => {
    const submitted = new Set(submittedAuthorIds);
    const fromSocket = pickUserIdList(rt, "creation_pending_user_ids", []);
    if (fromSocket.length > 0) return fromSocket;
    return voteExpectedPlayers.filter((p) => !submitted.has(p.user)).map((p) => p.user);
  }, [rt, submittedAuthorIds, voteExpectedPlayers]);

  const votedUserIds = useMemo(() => {
    const fromApi = activeEvent?.voting_submitted_user_ids ?? [];
    return pickUserIdList(rt, "voting_submitted_user_ids", fromApi);
  }, [rt, activeEvent?.voting_submitted_user_ids]);

  const pendingVoterIds = useMemo(() => {
    const voted = new Set(votedUserIds);
    const fromSocket = pickUserIdList(rt, "voting_pending_user_ids", []);
    if (fromSocket.length > 0) return fromSocket;
    return voteExpectedPlayers.filter((p) => !voted.has(p.user)).map((p) => p.user);
  }, [rt, votedUserIds, voteExpectedPlayers]);

  const creationTimeExpired = useMemo(() => {
    if (gamePhase !== "vote_creation") {
      return gamePhase === "vote_reveal" || gamePhase === "vote_voting";
    }
    if (!deadlineIso) return false;
    void tickToken;
    return Date.now() >= new Date(deadlineIso).getTime();
  }, [gamePhase, deadlineIso, tickToken]);

  const myAlreadySubmitted = Boolean(user?.user_id && submittedAuthorIds.includes(user.user_id));

  const authorName = useMemo(() => {
    const m = new Map<string, string>();
    activeEvent?.participants?.forEach((p) => m.set(String(p.user), p.username ?? `#${p.user}`));
    return (uid: string | number) => m.get(String(uid)) ?? `#${uid}`;
  }, [activeEvent?.participants]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "vote_best") return;
    if (gamePhase !== "vote_voting" && gamePhase !== "vote_reveal") {
      lastVoteOverlayKeyRef.current = null;
      return;
    }
    const overlayKey = `${activeEvent.id}:${activeEvent.current_round}:${activeEvent.current_voting_round ?? 1}:${gamePhase}`;
    if (gamePhase === "vote_voting" && lastVoteOverlayKeyRef.current !== overlayKey) {
      lastVoteOverlayKeyRef.current = overlayKey;
      setVoteOverlayOpen(true);
    }
  }, [
    activeEvent?.id,
    activeEvent?.event_type,
    activeEvent?.current_round,
    activeEvent?.current_voting_round,
    gamePhase,
  ]);

  useEffect(() => {
    const reason = typeof rt.reason === "string" ? rt.reason : "";
    const refreshReasons = [
      "submission_created",
      "vote_reveal",
      "vote_started",
      "vote_round_closed",
      "vote_tiebreak",
      "vote_round_advanced",
      "vote_creation_timeout",
      "vote_creation_closed",
      "vote_theme_started",
      "vote_registered",
      "vote_all_rounds_done",
      "quiz_question_timeout",
      "event_finished",
      "event_auto_finished_insufficient",
      "answer_submitted",
      "question_started",
      "event_begun",
      "event_begun_early",
    ];
    if (refreshReasons.includes(reason)) {
      void refreshActiveEvent();
    }
  }, [rt.reason, refreshActiveEvent]);

  useEffect(() => {
    if (gamePhase !== "vote_creation") {
      processedVoteTimeoutRef.current = null;
    }
  }, [activeEvent?.id, activeEvent?.current_round, gamePhase]);

  useEffect(() => {
    if (activeEvent?.event_type === "vote_best" && activeEvent.answer_time_sec) {
      setThemeTime(activeEvent.answer_time_sec);
    }
  }, [activeEvent?.id, activeEvent?.event_type, activeEvent?.answer_time_sec]);

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
    if (!activeEvent || activeEvent.event_type !== "vote_best") return;
    if (gamePhase !== "vote_creation" && gamePhase !== "vote_voting") return;
    const id = window.setInterval(() => setTickToken((x) => x + 1), 250);
    return () => window.clearInterval(id);
  }, [activeEvent?.id, activeEvent?.event_type, gamePhase]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "quiz_elimination") return;
    if (gamePhase !== "quiz_main" && gamePhase !== "quiz_finals") return;
    const id = window.setInterval(() => setTickToken((x) => x + 1), 250);
    return () => window.clearInterval(id);
  }, [activeEvent?.id, activeEvent?.event_type, gamePhase]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "quiz_elimination") return;
    if (gamePhase !== "quiz_main" && gamePhase !== "quiz_finals") return;
    const dl =
      pickOptionalIso(rt, "current_question_deadline_at", activeEvent.current_question_deadline_at) ??
      activeEvent.current_question_deadline_at;
    if (!dl) return;

    const processKey = `${activeEvent.id}:${gamePhase}:${dl}`;
    let cancelled = false;

    const fire = async () => {
      if (cancelled || processedQuizTimeoutRef.current === processKey) return;
      processedQuizTimeoutRef.current = processKey;
      await roomEventPostAction(activeEvent.id, "quiz-process-ticks");
      await refreshActiveEvent();
    };

    const deadlineMs = new Date(dl).getTime();
    if (Date.now() >= deadlineMs) {
      void fire();
      return () => {
        cancelled = true;
      };
    }

    const delayMs = Math.max(0, deadlineMs - Date.now() + 150);
    const id = window.setTimeout(() => {
      void fire();
    }, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [
    activeEvent?.id,
    activeEvent?.event_type,
    gamePhase,
    rt.current_question_deadline_at,
    activeEvent?.current_question_deadline_at,
    refreshActiveEvent,
  ]);

  useEffect(() => {
    if (gamePhase !== "quiz_main" && gamePhase !== "quiz_finals") {
      processedQuizTimeoutRef.current = null;
    }
  }, [activeEvent?.id, activeEvent?.current_round, activeEvent?.current_question_order, gamePhase]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "vote_best") return;
    if (gamePhase !== "vote_creation" && gamePhase !== "vote_voting") return;
    const dl =
      pickOptionalIso(rt, "current_question_deadline_at", activeEvent.current_question_deadline_at) ??
      activeEvent.current_question_deadline_at;
    if (!dl) return;

    const processKey = `${activeEvent.id}:${gamePhase}:${dl}`;
    let cancelled = false;

    const fire = async () => {
      if (cancelled || processedVoteTimeoutRef.current === processKey) return;
      processedVoteTimeoutRef.current = processKey;
      await roomEventPostAction(activeEvent.id, "vote-process-ticks");
      await refreshActiveEvent();
    };

    const deadlineMs = new Date(dl).getTime();
    if (Date.now() >= deadlineMs) {
      void fire();
      return () => {
        cancelled = true;
      };
    }

    const delayMs = Math.max(0, deadlineMs - Date.now() + 150);
    const id = window.setTimeout(() => {
      void fire();
    }, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [
    activeEvent?.id,
    activeEvent?.event_type,
    gamePhase,
    rt.current_question_deadline_at,
    activeEvent?.current_question_deadline_at,
    refreshActiveEvent,
  ]);

  useEffect(() => {
    if (!activeEvent || activeEvent.event_type !== "button_quiz") return;
    if (gamePhase !== "button_answering") return;
    const dl =
      pickOptionalIso(rt, "button_answer_deadline_at", activeEvent.button_answer_deadline_at) ??
      activeEvent.button_answer_deadline_at;
    const cl = pickNullableClaimedBy(rt, activeEvent.button_claimed_by);
    if (!cl || !dl) return;

    const processKey = `${activeEvent.id}:${cl}:${dl}`;
    let cancelled = false;

    const fire = async () => {
      if (cancelled || processedButtonTimeoutRef.current === processKey) return;
      processedButtonTimeoutRef.current = processKey;
      await roomEventPostAction(activeEvent.id, "button-process-ticks");
      await refreshActiveEvent();
    };

    const deadlineMs = new Date(dl).getTime();
    if (Date.now() >= deadlineMs) {
      void fire();
      return () => {
        cancelled = true;
      };
    }

    const delayMs = Math.max(0, deadlineMs - Date.now() + 150);
    const id = window.setTimeout(() => {
      void fire();
    }, delayMs);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
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

  useEffect(() => {
    const last = notices.at(-1);
    if (
      last?.code === "event_auto_finished_insufficient" ||
      last?.code === "event_finished"
    ) {
      const msg = last.message?.trim();
      if (msg?.includes("participantes suficientes") || last.code === "event_auto_finished_insufficient") {
        setAutoFinishMessage(msg || "O evento foi encerrado: participantes insuficientes.");
      }
    }
  }, [notices]);

  useEffect(() => {
    if (!activeEvent) {
      setAutoFinishMessage(null);
      return;
    }
    if (activeEvent.status === "recruiting") {
      setAutoFinishMessage(null);
    }
  }, [activeEvent]);

  useEffect(() => {
    const onEventKicked = (event: Event) => {
      const message = (event as CustomEvent<{ message?: string }>).detail?.message;
      setEventKickNotice(
        message?.trim() || "Você foi expulso deste evento e não pode mais participar.",
      );
    };
    window.addEventListener("playgether:event-kicked", onEventKicked);
    return () =>
      window.removeEventListener("playgether:event-kicked", onEventKicked);
  }, []);

  if (!activeEvent) return null;

  if (activeEvent.status === "finished") {
    const scores = [...(activeEvent.final_scores ?? [])].sort(
      (a: RoomEventFinalScore, b: RoomEventFinalScore) => (a.placement ?? 999) - (b.placement ?? 999)
    );
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-1 py-2">
        {autoFinishMessage ? (
          <div
            role="status"
            className="rounded-xl border border-amber-500/45 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-950 dark:text-amber-100"
          >
            {autoFinishMessage}
          </div>
        ) : null}
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
                        row.points_ranking != null && row.points_ranking !== 0
                          ? `Colocação +${row.points_ranking}`
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
            <p className="rounded-lg border border-border/60 bg-muted/60 px-3 py-3 text-sm text-muted-foreground">
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

  const submitCreation = () => {
    const text = creationText.trim();
    if (!text || !activeEvent) return;
    startTransition(async () => {
      setActionError(null);
      const result = await roomEventPostAction(activeEvent.id, "submit", {
        content: text,
        round_number: activeEvent.current_round,
      });
      if (result.ok) {
        setCreationText("");
      } else {
        setActionError(result.error ?? "Não foi possível enviar a criação.");
      }
      await refreshActiveEvent();
    });
  };

  const run = (action: string, body?: Record<string, unknown>) => {
    startTransition(async () => {
      setActionError(null);
      const result = await roomEventPostAction(activeEvent.id, action, body);
      if (!result.ok) {
        setActionError(result.error ?? "Ação falhou.");
      }
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
  const isRoomOwner = Boolean(user?.user_id && user.user_id === room.owner);
  const canManageEvent = isOrganizer || isRoomOwner;
  const canModerateEvent = canManageEvent;
  const kickableParticipants = (activeEvent.participants ?? []).filter(
    (p) =>
      p.participation_confirmed &&
      !p.left_early &&
      p.user !== activeEvent.created_by &&
      p.user !== user?.user_id
  );

  const chatInputDisabled =
    !mayUseChat ||
    othersFrozenWhileClaimerAnswers ||
    imClaimerMustAnswerFirst ||
    Boolean(muteNotice);

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

  const voteRoundLabel =
    activeEvent.event_type === "vote_best"
      ? activeEvent.current_round > activeEvent.rounds_total && gamePhase === "host_setup"
        ? "Todas as rodadas concluídas"
        : `Rodada ${Math.min(activeEvent.current_round, activeEvent.rounds_total)} de ${activeEvent.rounds_total}`
      : null;

  const showVoteThemeBanner =
    activeEvent.event_type === "vote_best" &&
    currentThemeText &&
    (gamePhase === "host_setup" ||
      gamePhase === "vote_creation" ||
      gamePhase === "vote_reveal" ||
      gamePhase === "vote_voting");

  const showVoteTimer =
    activeEvent.event_type === "vote_best" &&
    deadlineIso &&
    (gamePhase === "vote_creation" || gamePhase === "vote_voting");

  const showQuizTimer =
    activeEvent.event_type === "quiz_elimination" &&
    deadlineIso &&
    (gamePhase === "quiz_main" || gamePhase === "quiz_finals");

  const myAlreadyVoted = Boolean(activeEvent?.my_vote_submission_id);
  const myAlreadyAnsweredQuiz = Boolean(activeEvent?.my_answered_current_question);

  const showLiveQuestionBanner =
    (activeEvent.event_type === "button_quiz" &&
      (gamePhase === "button_answering" || gamePhase === "button_gabarito") &&
      liveQuestionText) ||
    (activeEvent.event_type === "quiz_elimination" &&
      (gamePhase === "quiz_main" || gamePhase === "quiz_finals") &&
      liveQuestionText);

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
    <div className="flex w-full flex-col gap-3 overflow-x-hidden pb-8 md:h-full md:min-h-0 md:max-h-full md:flex-row md:overflow-hidden md:pb-0">
      {eventKickNotice ? (
        <div
          role="alert"
          className="shrink-0 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-center text-sm font-semibold text-destructive"
        >
          {eventKickNotice}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-border/60 bg-card/50 md:h-full md:min-h-0">
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
              {voteRoundLabel ? (
                <p className="mt-1 text-xs font-semibold text-primary">{voteRoundLabel}</p>
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
          {showVoteThemeBanner ? (
            <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-primary">Tema da rodada</p>
              <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{currentThemeText}</p>
            </div>
          ) : null}
          {showVoteTimer && !creationTimeExpired ? (
            <div className="mt-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-primary/35 bg-gradient-to-br from-primary/15 to-card px-4 py-3 shadow-inner">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-primary">
                <Timer className="h-4 w-4" aria-hidden />
                {gamePhase === "vote_creation" ? "Tempo para criar" : "Tempo para votar"}
              </div>
              <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {(() => {
                  void tickToken;
                  const end = new Date(deadlineIso!).getTime();
                  const sec = Math.max(0, Math.ceil((end - Date.now()) / 1000));
                  return formatMmSs(sec);
                })()}
              </p>
            </div>
          ) : null}
          {showQuizTimer ? (
            <div className="mt-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-primary/35 bg-gradient-to-br from-primary/15 to-card px-4 py-3 shadow-inner">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-primary">
                <Timer className="h-4 w-4" aria-hidden />
                Tempo para responder
              </div>
              <p className="font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {(() => {
                  void tickToken;
                  const end = new Date(deadlineIso!).getTime();
                  const sec = Math.max(0, Math.ceil((end - Date.now()) / 1000));
                  return formatMmSs(sec);
                })()}
              </p>
            </div>
          ) : null}
          {activeEvent.event_type === "vote_best" && gamePhase === "vote_voting" && !voteOverlayOpen ? (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-primary/35 bg-primary/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-foreground">
                {isOrganizer
                  ? "Votação em andamento — encerre quando todos votarem."
                  : activeEvent.my_vote_submission_id
                    ? "Voto registrado. Você pode revisar as criações."
                    : "Votação aberta — escolha a melhor criação."}
              </p>
              <Button type="button" size="sm" className="shrink-0 gap-1.5" onClick={() => setVoteOverlayOpen(true)}>
                <Sparkles className="h-3.5 w-3.5" />
                {isOrganizer ? "Ver criações" : activeEvent.my_vote_submission_id ? "Ver criações" : "Votar agora"}
              </Button>
            </div>
          ) : null}
          {activeEvent.event_type === "vote_best" && gamePhase === "vote_creation" && creationTimeExpired ? (
            <p className="mt-3 rounded-lg bg-amber-500/15 px-3 py-2 text-center text-sm font-semibold text-amber-800 dark:text-amber-200">
              Tempo de criação encerrado — abrindo votação…
            </p>
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

        <div className="flex min-h-[8.5rem] flex-1 flex-col space-y-2 overflow-y-auto px-4 py-3 md:min-h-0">
          {eventMessages.length === 0 ? (
            <p className="m-auto px-2 text-center text-xs text-muted-foreground">
              Mensagens do evento aparecem aqui.
            </p>
          ) : null}
          {eventMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "group relative max-w-[92%] rounded-2xl px-3 py-2 text-sm",
                msg.is_system ? "bg-muted/50 text-muted-foreground" : "bg-primary/10 text-foreground"
              )}
            >
              {canModerateEvent && !msg.is_system && activeEvent ? (
                <div className="absolute right-1 top-1">
                  <RoomMessageActionsMenu
                    roomSlug={room.slug}
                    messageId={msg.id}
                    authorId={msg.author ?? undefined}
                    authorName={msg.username ?? "Participante"}
                    canDelete
                    canKickAuthor={false}
                    canMuteAuthor={false}
                    onDeleteMessage={() =>
                      deleteRoomEventMessage(activeEvent.id, msg.id)
                    }
                    onDeleted={() => removeEventMessage(msg.id)}
                    align="end"
                  />
                </div>
              ) : null}
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">
                {msg.username ?? "Sistema"}
              </p>
              <p className="whitespace-pre-wrap">{msg.body}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <footer className="relative z-10 shrink-0 border-t border-border/60 bg-card/90 p-3 backdrop-blur-md">
          {muteNotice ? (
            <p className="mb-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-800 dark:text-amber-200">
              {muteNotice}
            </p>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder={chatPlaceholder}
              disabled={chatInputDisabled}
              className="min-w-0 flex-1 rounded-full border border-border bg-muted/80 px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:opacity-60"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onSendChat())}
            />
            <button
              type="button"
              disabled={chatInputDisabled || !chatText.trim()}
              onClick={onSendChat}
              className="rounded-full gradient-primary p-2.5 text-primary-foreground transition-all hover:scale-105 hover:shadow-glow-primary active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none"
              aria-label="Enviar mensagem do evento"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 pb-6 md:w-[min(100%,380px)] md:max-w-[380px] md:overflow-y-auto md:pb-0">
        {activeEvent.event_type === "button_quiz" || activeEvent.event_type === "vote_best" ? (
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
            <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/40 p-1.5">
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

        {canModerateEvent ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Moderação do evento</p>
            {kickableParticipants.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum participante disponível para expulsão.</p>
            ) : (
              <ul className="space-y-2">
                {kickableParticipants.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-2 py-1.5">
                    <span className="truncate text-xs font-medium">{p.username ?? authorName(p.user)}</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isPending}
                      type="button"
                      onClick={() =>
                        setKickConfirm({
                          user: p.user,
                          label: p.username ?? authorName(p.user),
                        })
                      }
                    >
                      Expulsar
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {activeEvent.event_type === "vote_best" &&
        (gamePhase === "vote_reveal" || gamePhase === "vote_voting") ? (
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-primary">
              {gamePhase === "vote_voting" ? "Votação aberta" : "Criações reveladas"}
            </p>
            <p className="mb-3 text-xs text-muted-foreground">
              {roundSubmissions.length}{" "}
              {roundSubmissions.length === 1 ? "criação anônima" : "criações anônimas"} nesta rodada.
              {gamePhase === "vote_voting" && !isOrganizer && canPlay
                ? " Escolha a melhor — voto obrigatório."
                : null}
            </p>
            <Button
              type="button"
              className="w-full gap-2"
              variant={gamePhase === "vote_voting" ? "default" : "secondary"}
              onClick={() => setVoteOverlayOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              {gamePhase === "vote_voting" ? "Ver criações e votar" : "Ver criações"}
            </Button>
          </div>
        ) : null}

        {activeEvent.event_type === "vote_best" &&
        gamePhase === "vote_voting" &&
        canPlay &&
        !isOrganizer ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Seu voto</p>
            {myAlreadyVoted ? (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Voto registrado! Aguarde o fim do tempo ou o encerramento pelo organizador.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  Escolha a melhor criação — voto obrigatório.
                </p>
                <Button
                  type="button"
                  className="w-full gap-2"
                  onClick={() => setVoteOverlayOpen(true)}
                >
                  <Sparkles className="h-4 w-4" />
                  Ver criações e votar
                </Button>
              </>
            )}
          </div>
        ) : null}

        {activeEvent.event_type === "vote_best" &&
        gamePhase === "vote_creation" &&
        canPlay &&
        !isOrganizer ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Sua criação</p>
            {myAlreadySubmitted ? (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Criação enviada! Aguarde o fim do tempo ou a revelação pelo organizador.
              </p>
            ) : creationTimeExpired ? (
              <p className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                O tempo acabou — você não enviou a tempo.
              </p>
            ) : (
              <>
                <textarea
                  value={creationText}
                  onChange={(e) => setCreationText(e.target.value)}
                  className="mb-2 min-h-[88px] w-full rounded-xl border border-border/70 bg-background px-3 py-2 text-sm"
                  placeholder="Escreva conforme o tema do organizador…"
                />
                <Button
                  className="w-full"
                  disabled={!creationText.trim() || isPending}
                  type="button"
                  onClick={submitCreation}
                >
                  Enviar criação
                </Button>
              </>
            )}
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
                      Você tem {formatAnswerWindowLabel(answerTimeSec)} para responder ou será eliminado.
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

        {activeEvent.event_type === "quiz_elimination" && canPlay && !isOrganizer ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-3 space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">Resposta (quiz eliminatório)</p>
            {myAlreadyAnsweredQuiz && (gamePhase === "quiz_main" || gamePhase === "quiz_finals") ? (
              <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Resposta enviada! Aguarde o fim do tempo ou a próxima pergunta do organizador.
              </p>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : null}

        {isOrganizer ? (
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3 space-y-3">
            <p className="text-xs font-bold uppercase text-primary">Organizador</p>

            {activeEvent.event_type === "vote_best" ? (
              <div className="space-y-2">
                {gamePhase === "host_setup" && activeEvent.current_round <= activeEvent.rounds_total ? (
                  <>
                    <textarea
                      value={themeText}
                      onChange={(e) => setThemeText(e.target.value)}
                      className="min-h-[72px] w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      placeholder="Ex.: uma cantada de LoL, uma piada sobre astronomia…"
                    />
                    <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <span>Tempo para criar (5 s – 2 min)</span>
                      <input
                        type="number"
                        min={5}
                        max={120}
                        value={themeTime}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isNaN(n)) return;
                          setThemeTime(Math.min(120, Math.max(5, Math.round(n))));
                        }}
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm tabular-nums"
                      />
                    </label>
                    <Button
                      className="w-full"
                      disabled={!themeText.trim() || isPending}
                      type="button"
                      onClick={() =>
                        run("vote-set-theme", {
                          text: themeText.trim(),
                          time_limit_sec: Math.min(120, Math.max(5, themeTime)),
                        })
                      }
                    >
                      Definir tema
                    </Button>
                  </>
                ) : null}
                {gamePhase === "vote_creation" ? (
                  <div className="space-y-2 rounded-lg border border-border/50 bg-background/80 p-2">
                    <p className="text-xs font-semibold text-foreground">
                      Respostas: {submittedAuthorIds.length}/{voteExpectedPlayers.length}
                    </p>
                    {submittedAuthorIds.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          Já responderam
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs text-foreground">
                          {submittedAuthorIds.map((uid) => (
                            <li key={uid}>✓ {authorName(uid)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {pendingAuthorIds.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                          Aguardando
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {pendingAuthorIds.map((uid) => (
                            <li key={uid}>… {authorName(uid)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <Button
                      className="w-full"
                      type="button"
                      disabled={
                        isPending ||
                        pendingAuthorIds.length > 0 ||
                        voteExpectedPlayers.length === 0
                      }
                      onClick={() => run("reveal-creations")}
                    >
                      Ir para votação
                    </Button>
                    {pendingAuthorIds.length > 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        Disponível quando todos tiverem enviado, ou automaticamente ao fim do tempo.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {gamePhase === "vote_reveal" ? (
                  <>
                    <p className="text-[10px] text-muted-foreground">
                      Todos veem as criações. Inicie a votação quando estiver pronto.
                    </p>
                    <Button size="sm" className="w-full" type="button" disabled={isPending} onClick={() => run("start-voting")}>
                      Iniciar votação
                    </Button>
                  </>
                ) : null}
                {gamePhase === "vote_voting" ? (
                  <div className="space-y-2 rounded-lg border border-border/50 bg-background/80 p-2">
                    <p className="text-xs font-semibold text-foreground">
                      Votos: {votedUserIds.length}/{voteExpectedPlayers.length}
                    </p>
                    {votedUserIds.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          Já votaram
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs text-foreground">
                          {votedUserIds.map((uid) => (
                            <li key={uid}>✓ {authorName(uid)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {pendingVoterIds.length > 0 ? (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                          Aguardando
                        </p>
                        <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                          {pendingVoterIds.map((uid) => (
                            <li key={uid}>… {authorName(uid)}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <Button
                      size="sm"
                      className="w-full"
                      variant="destructive"
                      type="button"
                      disabled={isPending}
                      onClick={() => run("close-voting-round")}
                    >
                      Encerrar rodada de votos
                    </Button>
                    {pendingVoterIds.length > 0 ? (
                      <p className="text-[10px] text-muted-foreground">
                        Disponível quando todos tiverem votado, ou automaticamente ao fim do tempo.
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {activeEvent.current_round > activeEvent.rounds_total && gamePhase === "host_setup" ? (
                  <p className="text-[10px] font-medium text-primary">
                    Todas as rodadas concluídas — finalize o evento abaixo.
                  </p>
                ) : null}
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
          </div>
        ) : null}

        {canManageEvent ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
            <p className="mb-2 text-xs font-bold uppercase text-destructive">
              {isOrganizer ? "Encerrar evento" : "Dono da sala"}
            </p>
            <Button
              size="sm"
              className="w-full"
              variant="destructive"
              type="button"
              onClick={() => setFinalizeDialogOpen(true)}
            >
              Finalizar evento e pontuação
            </Button>
          </div>
        ) : null}

        {isPending ? (
          <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Atualizando…
          </p>
        ) : null}
        {actionError ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-destructive">
            {actionError}
          </p>
        ) : null}
      </aside>
    </div>

    {activeEvent.event_type === "vote_best" &&
    (gamePhase === "vote_reveal" || gamePhase === "vote_voting") ? (
      <VoteBestVotingOverlay
        open={voteOverlayOpen}
        onOpenChange={setVoteOverlayOpen}
        eventId={activeEvent.id}
        roundNumber={activeEvent.current_round ?? 1}
        themeText={currentThemeText}
        deadlineIso={gamePhase === "vote_voting" ? deadlineIso : null}
        tickToken={tickToken}
        submissions={roundSubmissions}
        myUserId={user?.user_id}
        myVoteSubmissionId={activeEvent.my_vote_submission_id}
        canVote={gamePhase === "vote_voting" && canPlay}
        isOrganizer={isOrganizer}
        onVoted={refreshActiveEvent}
        onError={setActionError}
      />
    ) : null}

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

    <AlertDialog open={Boolean(kickConfirm)} onOpenChange={(open) => !open && setKickConfirm(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Expulsar participante?</AlertDialogTitle>
          <AlertDialogDescription>
            {kickConfirm
              ? `Confirma expulsar ${kickConfirm.label} deste evento? Essa pessoa deixa de participar e não recebe pontos.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending || !kickConfirm}
            onClick={() => {
              const uid = kickConfirm?.user;
              setKickConfirm(null);
              if (uid != null) run("kick", { user_id: uid });
            }}
          >
            Expulsar
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

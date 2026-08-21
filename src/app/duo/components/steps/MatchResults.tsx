"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  RefreshCw,
  Trophy,
  Users,
  Gamepad2,
  SlidersHorizontal,
  Wifi,
  WifiOff,
  AlertCircle,
  CircleCheck,
  XCircle,
  Target,
  Crosshair,
  Timer,
  Percent,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ShieldCheck,
  Link2,
  UserPlus,
  Inbox,
  Check,
  X,
} from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { useDuoSocket } from "../../hooks/useDuoSocket";
import { useLiveExpiryLabel } from "../../hooks/useLiveExpiryLabel";
import {
  acceptDuoInvite,
  declineDuoInvite,
  getActiveQueues,
  getDuoInvites,
  sendDuoInvite,
} from "../../services/duoApi";
import { usePresenceContext } from "@/context/PresenceContext";
import { startConversation } from "@/services/directMessages";
import { useConversationsWidget } from "@/context/ConversationsWidgetContext";
import { LolRankEmblemFrame } from "@/components/lol/LolRankEmblemFrame";
import { LolLaneRoleIcon } from "@/components/lol/LolLaneRoleIcon";
import { ValorantRoleIcon } from "@/components/valorant/ValorantRoleIcon";
import { lolTierEmblemUrl } from "@/lib/lolRankedEmblem";
import { valorantTierEmblemUrl } from "@/lib/valorantRankEmblem";
import { RankEmblemBadge } from "@/components/lol/RankEmblemBadge";
import { CustomToast } from "@/components/ui/customSonner";
import type { DuoReplyDraft } from "@/context/ConversationsWidgetContext";
import type {
  DuoInvite,
  DuoMatch,
  MatchPartner,
  AccountVerification,
  Game,
  GamePreferences,
} from "../../types/duo";
import { isValorantDuoSlug } from "../../utils/isValorantGame";
import { VAL_RANK_COLORS, VAL_TIERS } from "../../constants/valorant";
import { premierRangeChipClass, premierRangeStyle } from "../../constants/csPremier";
import { PREMIER_RANGES } from "../../constants/csPremier";
import { ranks } from "../../constants/ranks";
import { collapseSelection } from "../../utils/collapseSelectionDisplay";
import { DUO_INVITE_CHANGED_EVENT } from "@/lib/duoInviteEvents";

type FilterMode = "all" | "online" | "requests";
type RequestsSubTab = "received" | "sent" | "completed";

function isInviteInMatches(match: DuoMatch) {
  return match.invite_status === "pending" || match.invite_status === "accepted";
}

interface MatchResultsProps {
  game: Game;
  preferences: Partial<GamePreferences>;
  initialTab?: FilterMode;
  /** Mesmo destino que «Editar preferências» em manage-queue: fluxo a partir da verificação do perfil. */
  onEditFilters: () => void;
  /** Fila expirou (TTL) — voltar ao passo de preferências avançadas. */
  onQueueExpired: () => void;
  /** Saiu da fila — volta à lista inicial do Duo Finder. */
  onLeaveQueue: () => void;
  /** Volta à escolha de jogos (lista inicial do Duo Finder). */
  onChooseGame: () => void;
}

const PATIENT_SEARCH_MS = 50_000;
const CS2_ROLE_OPTIONS = ["AWPer", "Entry", "Second Entry", "Support", "Lurker", "IGL"] as const;

function partnerLooksActive(status: string) {
  return status === "online" || status === "away" || status === "dnd";
}

function isPartnerAccountLinked(
  verification?: AccountVerification | null,
): boolean {
  return Boolean(
    verification?.connected &&
      verification.level !== "self_declared" &&
      verification.level !== "none",
  );
}

function buildDuoReplyDraft(
  match: DuoMatch,
  partner: DuoMatch["partner"],
  displayName: string,
): DuoReplyDraft {
  return {
    gameName: match.game_name,
    matchPercent: Math.round(match.score),
    partnerUsername: partner.username,
    partnerName: displayName,
    partnerAvatar: partner.profile_photo,
  };
}

function summarizeSelectionList(
  values: unknown,
  options: { allCount?: number; allLabel?: string; maxVisible?: number } = {}
) {
  if (!Array.isArray(values) || values.length === 0) return "";

  const allCount = options.allCount;
  const allLabel = options.allLabel ?? "Todas";
  const maxVisible = options.maxVisible ?? 3;
  const normalized = values
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);

  if (normalized.length === 0) return "";
  if (allCount && normalized.length >= allCount) return allLabel;
  if (normalized.length <= maxVisible) return normalized.join(", ");

  return `${normalized.slice(0, maxVisible).join(", ")} +${normalized.length - maxVisible}`;
}

export function MatchResults({
  game,
  preferences,
  initialTab = "all",
  onEditFilters,
  onQueueExpired,
  onLeaveQueue,
  onChooseGame,
}: MatchResultsProps) {
  const slug = game.acronym.toLowerCase();
  const router = useRouter();
  const { getPresence } = usePresenceContext();
  const [filterMode, setFilterMode] = useState<FilterMode>(
    initialTab === "requests" ? "requests" : initialTab === "online" ? "online" : "all",
  );
  const [requestsSubTab, setRequestsSubTab] = useState<RequestsSubTab>("received");
  /** Começa em true para não exibir o vazio «ninguém encontrado» antes do primeiro start_search. */
  const [searching, setSearching] = useState(true);
  const [searchPhase, setSearchPhase] = useState<"active" | "patient">("active");
  const [invites, setInvites] = useState<DuoInvite[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const prefsSignature = useMemo(
    () => JSON.stringify(preferences ?? {}),
    [preferences]
  );
  const lastSentPrefsSigRef = useRef<string | null>(null);
  const expiryNavigateRef = useRef(false);

  const loadInvites = async (options?: { quiet?: boolean }) => {
    setInvitesLoading(true);
    try {
      const [received, sent, completed] = await Promise.all([
        getDuoInvites({
          game_slug: slug,
          direction: "received",
          status: "pending",
        }),
        getDuoInvites({
          game_slug: slug,
          direction: "sent",
          status: "pending",
        }),
        getDuoInvites({
          game_slug: slug,
          direction: "all",
          status: "accepted",
        }),
      ]);
      const byId = new Map<number, DuoInvite>();
      for (const row of [...received, ...sent, ...completed]) {
        byId.set(row.id, row);
      }
      setInvites([...byId.values()]);
    } catch {
      if (!options?.quiet) {
        CustomToast.error("Não foi possível carregar as solicitações.");
      }
    } finally {
      setInvitesLoading(false);
    }
  };

  const {
    connected,
    queueStatus,
    expiresAt,
    isNearExpiry,
    evictionReason,
    matches,
    error,
    startSearch,
    leaveQueue,
    renewQueue,
    pulseDuoResultsPresence,
    patchMatchInvite,
  } = useDuoSocket({
    gameSlug: slug,
    enabled: true,
    onInviteUpdate: () => {
      void loadInvites({ quiet: true });
    },
  });

  const liveExpiryLabel = useLiveExpiryLabel(
    queueStatus === "in_queue" ||
      queueStatus === "searching" ||
      queueStatus === "renewed"
      ? expiresAt
      : null
  );

  // Reenvia start_search quando conecta, reconecta ou as preferências mudam (ex.: voltou dos filtros).
  useEffect(() => {
    if (!connected) return;
    if (lastSentPrefsSigRef.current === prefsSignature) return;
    lastSentPrefsSigRef.current = prefsSignature;
    setSearching(true);
    setSearchPhase("active");
    startSearch(preferences);
  }, [connected, prefsSignature, preferences, startSearch]);

  useEffect(() => {
    if (!connected) return;
    pulseDuoResultsPresence();
    const id = window.setInterval(pulseDuoResultsPresence, 45_000);
    return () => window.clearInterval(id);
  }, [connected, pulseDuoResultsPresence]);

  useEffect(() => {
    if (error) setSearching(false);
  }, [error]);

  useEffect(() => {
    if (queueStatus === "evicted" || queueStatus === "left") {
      setSearching(false);
    }
  }, [queueStatus]);

  useEffect(() => {
    if (queueStatus !== "evicted" || evictionReason !== "expired") return;
    if (expiryNavigateRef.current) return;
    expiryNavigateRef.current = true;
    lastSentPrefsSigRef.current = null;
    onQueueExpired();
  }, [queueStatus, evictionReason, onQueueExpired]);

  useEffect(() => {
    if (!expiresAt) return;
    const activeInQueue =
      queueStatus === "in_queue" ||
      queueStatus === "searching" ||
      queueStatus === "renewed" ||
      queueStatus === "preferences_updated";
    if (!activeInQueue) return;

    let cancelled = false;
    const tick = async () => {
      if (new Date(expiresAt).getTime() > Date.now()) return;
      if (expiryNavigateRef.current) return;
      try {
        const queues = await getActiveQueues();
        if (cancelled) return;
        const still = queues.find((q) => (q.game_slug || "").toLowerCase() === slug);
        if (!still) {
          expiryNavigateRef.current = true;
          lastSentPrefsSigRef.current = null;
          onQueueExpired();
        }
      } catch {
        /* ignore */
      }
    };

    const id = window.setInterval(() => void tick(), 2000);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [expiresAt, queueStatus, slug, onQueueExpired]);

  useEffect(() => {
    if (!searching || matches.length > 0) {
      setSearchPhase("active");
      return;
    }
    const t = window.setTimeout(() => setSearchPhase("patient"), PATIENT_SEARCH_MS);
    return () => window.clearTimeout(t);
  }, [searching, matches.length]);

  // After initial matches arrive stop "searching" spinner
  useEffect(() => {
    if (matches.length > 0) {
      setSearching(false);
    }
  }, [matches]);

  useEffect(() => {
    if (initialTab === "requests") {
      setFilterMode("requests");
    }
  }, [initialTab]);

  useEffect(() => {
    void loadInvites({ quiet: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (filterMode !== "requests") return;
    void loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode]);

  useEffect(() => {
    const onChanged = () => {
      void loadInvites({ quiet: true });
    };
    window.addEventListener(DUO_INVITE_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(DUO_INVITE_CHANGED_EVENT, onChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const setResultsTab = (mode: FilterMode) => {
    setFilterMode(mode);
    const params = new URLSearchParams({
      game: slug,
      step: "results",
    });
    if (mode === "requests") params.set("tab", "requests");
    router.replace(`/duo?${params.toString()}`, { scroll: false });
  };

  const receivedInvites = invites.filter(
    (i) => i.status === "pending" && i.direction === "received",
  );
  const sentInvites = invites.filter(
    (i) => i.status === "pending" && i.direction === "sent",
  );
  const completedInvites = invites.filter((i) => i.status === "accepted");
  const pendingReceivedCount = receivedInvites.length;

  const requestsForSubTab =
    requestsSubTab === "received"
      ? receivedInvites
      : requestsSubTab === "sent"
        ? sentInvites
        : completedInvites;

  const availableMatches = matches.filter((m) => !isInviteInMatches(m));

  const displayedMatches: DuoMatch[] =
    filterMode === "online"
      ? availableMatches.filter((m) =>
          partnerLooksActive(getPresence(m.partner.user_id).status),
        )
      : availableMatches;

  const sortedMatches = [...displayedMatches].sort((a, b) => b.score - a.score);

  const bootstrapping = queueStatus === null && !error;
  const showMatchList = filterMode !== "requests";

  return (
    <div className="min-h-layout-main w-full max-w-full px-4 py-5 sm:py-8">
      <div className="mx-auto w-full max-w-5xl animate-slide-in-up">
        {/* Header */}
        <div className="mb-5 mt-4 flex flex-col gap-3 sm:mb-6 sm:mt-12 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight text-card-foreground sm:text-3xl">
              {game.name} – Duos
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-1 sm:max-w-xl sm:text-base">
              {sortedMatches.length > 0 ? (
                <>
                  {sortedMatches.length} parceiro{sortedMatches.length !== 1 ? "s" : ""}{" "}
                  {sortedMatches.length === 1 ? "compatível" : "compatíveis"}
                </>
              ) : searching && searchPhase === "patient" ? (
                <>
                  Ninguém compatível com seus filtros agora. Se aparecer alguém, avisamos por
                  notificação. Pode ficar aqui ou usar o resto do app à vontade.
                </>
              ) : searching ? (
                "Buscando parceiros compatíveis com seus filtros…"
              ) : (
                "Pronto para novas sugestões."
              )}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-border/50 bg-muted/50 px-2.5 py-1 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            {connected ? (
              <Wifi className="h-3.5 w-3.5 text-neon-green sm:h-4 sm:w-4" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-muted-foreground sm:h-4 sm:w-4" />
            )}
            <span className="text-xs text-muted-foreground">
              {connected ? "Conectado" : "Reconectando..."}
            </span>
          </div>
        </div>

        {/* Queue status bar */}
        {(queueStatus === "in_queue" ||
          queueStatus === "searching" ||
          queueStatus === "renewed") && (
          <div className="card-glass mb-5 flex flex-col gap-3 rounded-xl p-3.5 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
            <div className="flex min-w-0 items-start gap-2.5 sm:items-center sm:gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-neon-green sm:mt-0" />
              <div className="min-w-0 text-sm text-muted-foreground">
                <span className="font-medium text-card-foreground/90">Na fila</span>
                {liveExpiryLabel ? (
                  <span className="mt-0.5 block sm:mt-0 sm:inline">
                    <span className="hidden sm:inline"> · </span>
                    Expira em {liveExpiryLabel}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 text-xs border-border sm:flex-none"
                onClick={onEditFilters}
              >
                <SlidersHorizontal className="mr-1 h-3 w-3" />
                Mudar filtros
              </Button>
              {isNearExpiry && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 flex-1 text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 sm:flex-none"
                  onClick={renewQueue}
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Renovar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 flex-1 text-xs text-muted-foreground hover:text-destructive sm:flex-none"
                onClick={() => {
                  leaveQueue();
                  onLeaveQueue();
                }}
              >
                Sair da fila
              </Button>
            </div>
          </div>
        )}

        {queueStatus === "evicted" && evictionReason !== "expired" && (
          <div className="card-glass rounded-xl p-4 mb-6 flex items-center space-x-3 border-yellow-500/30">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-yellow-400">
              Você foi removido da fila por inatividade.
            </span>
            <Button
              size="sm"
              className="ml-auto bg-gradient-primary text-primary-foreground"
              onClick={() => {
                lastSentPrefsSigRef.current = null;
                setSearching(true);
                startSearch(preferences);
              }}
            >
              Voltar à fila
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-4 text-destructive text-sm mb-4">
            {error}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              { mode: "all" as const, label: "Todos", icon: "users" },
              { mode: "online" as const, label: "Online", icon: "online" },
              { mode: "requests" as const, label: "Solicitações", icon: "inbox" },
            ] as const
          ).map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setResultsTab(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterMode === mode
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {icon === "users" ? (
                <Users className="w-4 h-4 inline-block mr-1" />
              ) : icon === "inbox" ? (
                <Inbox className="w-4 h-4 inline-block mr-1" />
              ) : (
                <span className="w-2 h-2 bg-neon-green rounded-full inline-block mr-1" />
              )}
              {label}
              {mode === "requests" && pendingReceivedCount > 0 ? (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/25 px-1.5 text-[11px] tabular-nums text-primary">
                  {pendingReceivedCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {filterMode === "requests" ? (
          <div className="mb-10">
            <div className="mb-4 flex flex-wrap gap-2">
              {(
                [
                  {
                    id: "received" as const,
                    label: "Recebidas",
                    count: receivedInvites.length,
                  },
                  {
                    id: "sent" as const,
                    label: "Enviadas",
                    count: sentInvites.length,
                  },
                  {
                    id: "completed" as const,
                    label: "Concluídas",
                    count: completedInvites.length,
                  },
                ] as const
              ).map(({ id, label, count }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRequestsSubTab(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    requestsSubTab === id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:text-card-foreground"
                  }`}
                >
                  {label}
                  {count > 0 ? (
                    <span className="ml-1.5 tabular-nums opacity-80">{count}</span>
                  ) : null}
                </button>
              ))}
            </div>

            {invitesLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-primary/20 rounded-full" />
                  <div className="w-14 h-14 border-4 border-transparent border-t-primary rounded-full animate-spin absolute inset-0" />
                </div>
                <p className="text-sm text-muted-foreground">Carregando solicitações…</p>
              </div>
            ) : requestsForSubTab.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Inbox className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center text-sm max-w-sm">
                  {requestsSubTab === "received"
                    ? "Nenhuma solicitação recebida. Quando alguém te chamar para duo, aparece aqui."
                    : requestsSubTab === "sent"
                      ? "Você ainda não enviou solicitações pendentes."
                      : "Nenhum duo concluído ainda. Aceites aparecem aqui com o chat liberado."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {requestsForSubTab.map((invite, index) => (
                  <InviteRequestCard
                    key={invite.id}
                    invite={invite}
                    index={index}
                    variant={
                      invite.status === "accepted"
                        ? "completed"
                        : invite.direction === "sent"
                          ? "sent"
                          : "received"
                    }
                    onResolved={(id) =>
                      setInvites((prev) => prev.filter((row) => row.id !== id))
                    }
                    onAccepted={(updated) => {
                      setInvites((prev) => {
                        const without = prev.filter((row) => row.id !== updated.id);
                        return [...without, { ...updated, status: "accepted" as const }];
                      });
                      setRequestsSubTab("completed");
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Estado inicial: evita overlay «ninguém encontrado» antes do WebSocket / fila */}
        {showMatchList && bootstrapping && matches.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-24 space-y-3 px-4"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
              <div className="w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-sm text-muted-foreground">Verificando fila…</p>
          </div>
        )}

        {/* Searching indicator */}
        {showMatchList && !bootstrapping && searching && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 px-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
              <div className="w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin absolute inset-0" />
            </div>
            {searchPhase === "patient" ? (
              <div className="text-center text-muted-foreground max-w-md space-y-2 text-sm leading-relaxed">
                <p>
                  Ainda não encontramos ninguém com esses filtros neste momento. Quando surgir uma
                  combinação, você será notificado (se não estiver nesta tela).
                </p>
                <p>
                  Pode continuar aqui ou navegar pelo feed e pelo restante do app — sua fila segue
                  ativa.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">Buscando parceiros compatíveis…</p>
            )}
          </div>
        )}

        {/* Match Cards */}
        {showMatchList && sortedMatches.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {sortedMatches.map((match, index) => (
              <MatchCard
                key={`${match.id}-${match.partner.user_id}`}
                match={match}
                index={index}
                onInviteSent={() => {
                  patchMatchInvite(match.id, {
                    invite_status: "pending",
                    invite_direction: "sent",
                    outgoing_invite_status: "pending",
                  });
                  void loadInvites({ quiet: true });
                  setResultsTab("requests");
                  setRequestsSubTab("sent");
                }}
              />
            ))}
          </div>
        )}

        {/* No results (and not searching) */}
        {showMatchList &&
          !bootstrapping &&
          !searching &&
          sortedMatches.length === 0 &&
          queueStatus !== "evicted" &&
          evictionReason !== "expired" && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Trophy className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Nenhum parceiro encontrado ainda.
              <br />
              Você será notificado quando surgirem novos matches!
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <Button
            variant="outline"
            className="px-8 py-3 border-primary/30 text-primary hover:bg-primary/10"
            onClick={onChooseGame}
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            Escolher jogo
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared partner profile body (matches + solicitations) ───────────────────

function MatchPartnerDetails({
  partner,
  gameSlug,
}: {
  partner: MatchPartner;
  gameSlug: string;
}) {
  const prefs = partner.preferences as Record<string, any>;
  const slug = gameSlug;
  const gs = (partner.game_stats ?? {}) as Record<string, any>;
  const accountLinked = isPartnerAccountLinked(partner.account_verification);

  return (
    <>
      {partner.highlighted_achievements &&
      partner.highlighted_achievements.length > 0 ? (
        <div className="mb-4">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Conquistas em destaque
          </p>
          <HighlightedAchievementBadges achievements={partner.highlighted_achievements} />
        </div>
      ) : null}

      {typeof prefs.duo_note === "string" && prefs.duo_note.trim() ? (
        <div className="mb-4 rounded-lg border border-primary/25 bg-primary/[0.06] p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-primary">
            <MessageSquare className="h-3 w-3 shrink-0" />
            Recado dele
          </p>
          <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap break-words">
            {prefs.duo_note.trim()}
          </p>
        </div>
      ) : null}

      <div className="space-y-4 mb-5">
        {slug === "lol" && (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-0">
              <div className="min-w-0 space-y-2 sm:pr-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Dele
                </p>
                {prefs.main_role ? (
                  <InfoRow
                    label="Lane principal"
                    value={prefs.main_role}
                    valuePrefix={
                      <LolLaneRoleIcon roleLabel={String(prefs.main_role)} className="h-3.5 w-3.5" />
                    }
                  />
                ) : null}
                {prefs.secondary_role ? (
                  <InfoRow
                    label="Lane secundária"
                    value={prefs.secondary_role}
                    valuePrefix={
                      <LolLaneRoleIcon
                        roleLabel={String(prefs.secondary_role)}
                        className="h-3.5 w-3.5"
                      />
                    }
                  />
                ) : null}
                {prefs.own_elo && !accountLinked ? (
                  <div className="w-full min-w-0 space-y-1.5 text-sm">
                    <p className="text-muted-foreground leading-5">Elo declarado</p>
                    <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                      <LolTierBadge tier={String(prefs.own_elo)} />
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0 space-y-2 sm:border-l sm:border-border/60 sm:pl-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  O que procura
                </p>
                {prefs.desired_roles?.length > 0 ? (
                  <div className="w-full min-w-0 space-y-1.5 text-sm">
                    <p className="text-muted-foreground leading-5">Lanes no duo</p>
                    <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                      {(prefs.desired_roles as string[]).map((lane) => (
                        <span
                          key={lane}
                          className="inline-flex shrink-0 items-center gap-0.5 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5"
                        >
                          <LolLaneRoleIcon roleLabel={lane} className="h-3.5 w-3.5" />
                          <span className="whitespace-nowrap text-[11px] font-medium leading-none text-card-foreground">
                            {lane}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {prefs.accepted_elo?.length > 0 ? (
                  <div className="w-full min-w-0 space-y-1.5 text-sm">
                    <p className="text-muted-foreground leading-5">Elos que aceita</p>
                    <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                      <CollapsedLolTierList tiers={prefs.accepted_elo as string[]} />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {accountLinked ? (
              <div className="pt-3 border-t border-border/50">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Conta ranqueada (Riot)
                </p>
                <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4">
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/60 p-2.5">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    {typeof gs.tier_emblem_url === "string" && gs.tier_emblem_url.trim() ? (
                      <LolRankEmblemFrame
                        src={gs.tier_emblem_url}
                        alt=""
                        frameClass="h-10 w-10"
                        zoomPercent={182}
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/50 text-[10px] text-muted-foreground"
                        aria-hidden
                      >
                        —
                      </div>
                    )}
                  </div>
                  <div className="mt-auto w-full text-center">
                    <div className="text-[10px] leading-tight text-muted-foreground">Elo</div>
                    <div className="mt-0.5 break-words text-sm font-semibold leading-tight text-card-foreground">
                      {typeof gs.rank === "string" && gs.rank.trim() ? gs.rank : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/60 p-2.5">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <CircleCheck className="h-5 w-5 text-emerald-400" strokeWidth={2.25} />
                  </div>
                  <div className="mt-auto w-full text-center">
                    <div className="text-[10px] leading-tight text-muted-foreground">Vitórias</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-card-foreground">
                      {typeof gs.wins === "number" ? gs.wins : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/60 p-2.5">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <XCircle className="h-5 w-5 text-rose-400" strokeWidth={2.25} />
                  </div>
                  <div className="mt-auto w-full text-center">
                    <div className="text-[10px] leading-tight text-muted-foreground">Derrotas</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-card-foreground">
                      {typeof gs.losses === "number" ? gs.losses : "—"}
                    </div>
                  </div>
                </div>
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/60 p-2.5">
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <Percent className="h-5 w-5 text-sky-400" strokeWidth={2.25} />
                  </div>
                  <div className="mt-auto w-full text-center">
                    <div className="text-[10px] leading-tight text-muted-foreground">Winrate</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-card-foreground">
                      {gs.winrate != null && Number.isFinite(Number(gs.winrate))
                        ? `${gs.winrate}%`
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ) : null}
          </>
        )}

        {slug === "cs2" && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0">
              <div className="space-y-2 sm:pr-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  Dele
                </p>
                {prefs.own_range ? (
                  <PremierRangeRow label="Faixa Premier" range={prefs.own_range} />
                ) : null}
                {prefs.roles?.length > 0 ? (
                  <InfoRow
                    label="Funções"
                    value={summarizeSelectionList(prefs.roles, {
                      allCount: CS2_ROLE_OPTIONS.length,
                      allLabel: "Todas",
                    })}
                  />
                ) : null}
                {prefs.favorite_weapons?.length > 0 ? (
                  <InfoRow
                    label="Armas favoritas"
                    value={summarizeSelectionList(prefs.favorite_weapons, {
                      maxVisible: 3,
                    })}
                  />
                ) : null}
              </div>
              <div className="space-y-2 sm:border-l sm:border-border/60 sm:pl-4">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  O que procura
                </p>
                {prefs.accepted_ranges?.length > 0 ? (
                  <div className="w-full min-w-0 space-y-1.5 text-sm">
                    <p className="text-muted-foreground leading-5">Faixas que aceita</p>
                    <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                      <CollapsedPremierRangeList ranges={prefs.accepted_ranges as string[]} />
                    </div>
                  </div>
                ) : null}
                {prefs.desired_roles?.length > 0 ? (
                  <InfoRow
                    label="Funções no duo"
                    value={summarizeSelectionList(prefs.desired_roles, {
                      allCount: CS2_ROLE_OPTIONS.length,
                      allLabel: "Todas",
                    })}
                  />
                ) : null}
              </div>
            </div>

            {accountLinked ? (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Stats CS2
                </p>
                <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted/60 border border-border/40 p-2.5 text-center">
                  <Target className="h-4 w-4 mx-auto mb-1 text-neon-green" />
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    K/D
                  </div>
                  <div className="font-semibold text-sm text-card-foreground">
                    {gs.kd != null ? String(gs.kd) : "Sem estatísticas"}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/60 border border-border/40 p-2.5 text-center">
                  <Crosshair className="h-4 w-4 mx-auto mb-1 text-sky-400" />
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    HS%
                  </div>
                  <div className="font-semibold text-sm text-card-foreground">
                    {gs.hs_percent != null ? `${gs.hs_percent}%` : "Sem estatísticas"}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/60 border border-border/40 p-2.5 text-center">
                  <Timer className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    Tempo no jogo
                  </div>
                  <div className="font-semibold text-sm text-card-foreground">
                    {gs.hours_played != null ? `${gs.hours_played} h` : "Sem estatísticas"}
                  </div>
                </div>
              </div>
            </div>
            ) : null}
          </>
        )}

        {isValorantDuoSlug(slug) ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-0">
            <div className="space-y-2 sm:pr-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Dele
              </p>
              {prefs.own_elo ? (
                <ValorantEloRow label="Elo informado" tier={prefs.own_elo} />
              ) : null}
              {prefs.roles?.length > 0 ? (
                <div className="w-full min-w-0 space-y-1.5 text-sm">
                  <p className="text-muted-foreground leading-5">Funções</p>
                  <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                    {(prefs.roles as string[]).map((role) => (
                      <span
                        key={role}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5"
                      >
                        <ValorantRoleIcon roleLabel={role} className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap text-[11px] font-medium leading-none text-card-foreground">
                          {role}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className="space-y-2 sm:border-l sm:border-border/60 sm:pl-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                O que procura
              </p>
              {prefs.accepted_elo?.length > 0 ? (
                <div className="w-full min-w-0 space-y-1.5 text-sm">
                  <p className="text-muted-foreground leading-5">Elos que aceita</p>
                  <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                    <CollapsedValorantTierList tiers={prefs.accepted_elo as string[]} />
                  </div>
                </div>
              ) : null}
              {prefs.desired_roles?.length > 0 ? (
                <div className="w-full min-w-0 space-y-1.5 text-sm">
                  <p className="text-muted-foreground leading-5">Funções no duo</p>
                  <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
                    {(prefs.desired_roles as string[]).map((role) => (
                      <span
                        key={role}
                        className="inline-flex shrink-0 items-center gap-0.5 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5"
                      >
                        <ValorantRoleIcon roleLabel={role} className="h-3.5 w-3.5" />
                        <span className="whitespace-nowrap text-[11px] font-medium leading-none text-card-foreground">
                          {role}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {prefs.play_times?.length > 0 ? (
          <div className="pt-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Costuma jogar
            </p>
            <div className="flex flex-wrap gap-3">
              {prefs.play_times.map((t: string) => (
                <PlayTimeChip key={t} slotId={t} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

// ─── Invite request card ──────────────────────────────────────────────────────

function InviteRequestCard({
  invite,
  index,
  variant,
  onResolved,
  onAccepted,
}: {
  invite: DuoInvite;
  index: number;
  variant: "received" | "sent" | "completed";
  onResolved: (inviteId: number) => void;
  onAccepted?: (invite: DuoInvite) => void;
}) {
  const partner = invite.partner;
  const { openWithConversation } = useConversationsWidget();
  const [busy, setBusy] = useState<"accept" | "decline" | "chat" | null>(null);

  const displayName = partner.first_name
    ? `${partner.first_name} ${partner.last_name}`.trim()
    : partner.username;

  const verification = partner.account_verification;
  const showVerifiedBadge = verification?.level === "verified";
  const showLinkedBadge = verification?.level === "linked";

  const duoReplyDraft = buildDuoReplyDraft(
    {
      id: invite.match_id,
      game_name: invite.game_name,
      game_slug: invite.game_slug,
      score: invite.score,
      created_at: invite.created_at,
      partner,
    },
    partner,
    displayName,
  );

  const openChat = async () => {
    setBusy("chat");
    try {
      if (invite.conversation_id) {
        openWithConversation(invite.conversation_id, {
          duoReply: duoReplyDraft,
        });
        return;
      }
      if (!partner.user_id) return;
      const result = await startConversation(String(partner.user_id), {
        source: "duo",
        duoInviteId: invite.id,
      });
      if (result.ok) {
        openWithConversation(result.conversation.id, {
          duoReply: duoReplyDraft,
        });
      } else {
        CustomToast.error(result.error);
      }
    } finally {
      setBusy(null);
    }
  };

  const statusLabel =
    variant === "completed"
      ? "Duo aceito"
      : variant === "sent"
        ? "Aguardando resposta"
        : "Quer jogar duo agora";

  return (
    <div
      className="card-glass min-w-0 bg-[#0F172A] rounded-xl p-6 animate-fade-in-scale"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="relative inline-block">
            <ProfileAvatar
              displayName={displayName}
              username={partner.username}
              profilePhoto={partner.profile_photo}
              sizeClass="h-14 w-14"
              ringClass="border-2 border-primary/30"
              fallbackTextClassName="text-xl font-bold"
            />
            <PresenceStatusDot
              userId={partner.user_id}
              sizeClass="w-3.5 h-3.5"
              className="-translate-x-1 -translate-y-1"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-card-foreground">{displayName}</h3>
              {showVerifiedBadge ? (
                <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-[10px] font-medium px-1.5 py-0">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {verification?.label ?? "Verificado"}
                </Badge>
              ) : showLinkedBadge ? (
                <Badge className="border-sky-500/40 bg-sky-500/15 text-sky-300 text-[10px] font-medium px-1.5 py-0">
                  <Link2 className="mr-1 h-3 w-3" />
                  {verification?.label ?? "Conta conectada"}
                </Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">@{partner.username}</p>
            <p className="mt-1 text-xs text-primary">{statusLabel}</p>
          </div>
        </div>
        <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
          {Math.round(invite.score)}% match
        </Badge>
      </div>

      <MatchPartnerDetails partner={partner} gameSlug={invite.game_slug} />

      {variant === "completed" ? (
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-gradient-primary hover:shadow-glow-primary text-primary-foreground"
            disabled={busy !== null || !partner.user_id}
            onClick={() => void openChat()}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {busy === "chat" ? "Abrindo..." : "Abrir chat"}
          </Button>
        </div>
      ) : variant === "sent" ? (
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-muted/50 text-muted-foreground"
            disabled
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convite enviado
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-gradient-primary hover:shadow-glow-primary text-primary-foreground"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("accept");
              try {
                const accepted = await acceptDuoInvite(invite.id);
                CustomToast.success(`Você aceitou o duo com @${partner.username}!`);
                onAccepted?.(accepted);
              } catch (error) {
                CustomToast.error(
                  error instanceof Error ? error.message : "Não foi possível aceitar.",
                );
              } finally {
                setBusy(null);
              }
            }}
          >
            <Check className="w-4 h-4 mr-2" />
            {busy === "accept" ? "Aceitando..." : "Aceitar"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-border text-muted-foreground hover:text-destructive hover:border-destructive/40"
            disabled={busy !== null}
            onClick={async () => {
              setBusy("decline");
              try {
                await declineDuoInvite(invite.id);
                CustomToast.info("Solicitação recusada.");
                onResolved(invite.id);
              } catch (error) {
                CustomToast.error(
                  error instanceof Error ? error.message : "Não foi possível recusar.",
                );
              } finally {
                setBusy(null);
              }
            }}
          >
            <X className="w-4 h-4 mr-2" />
            {busy === "decline" ? "Recusando..." : "Recusar"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({
  match,
  index,
  onInviteSent,
}: {
  match: DuoMatch;
  index: number;
  onInviteSent?: () => void;
}) {
  const partner = match.partner;
  const [isInviting, setIsInviting] = useState(false);

  const displayName = partner.first_name
    ? `${partner.first_name} ${partner.last_name}`.trim()
    : partner.username;

  const verification = partner.account_verification;
  const showVerifiedBadge = verification?.level === "verified";
  const showLinkedBadge = verification?.level === "linked";

  return (
    <div
      className="card-glass min-w-0 bg-[#0F172A] rounded-xl p-6 animate-fade-in-scale hover:scale-[1.02] transition-all duration-300"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="relative inline-block">
            <ProfileAvatar
              displayName={displayName}
              username={partner.username}
              profilePhoto={partner.profile_photo}
              sizeClass="h-14 w-14"
              ringClass="border-2 border-primary/30"
              fallbackTextClassName="text-xl font-bold"
            />
            <PresenceStatusDot
              userId={partner.user_id}
              sizeClass="w-3.5 h-3.5"
              className="-translate-x-1 -translate-y-1"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-card-foreground">{displayName}</h3>
              {showVerifiedBadge ? (
                <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-[10px] font-medium px-1.5 py-0">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  {verification?.label ?? "Verificado"}
                </Badge>
              ) : showLinkedBadge ? (
                <Badge className="border-sky-500/40 bg-sky-500/15 text-sky-300 text-[10px] font-medium px-1.5 py-0">
                  <Link2 className="mr-1 h-3 w-3" />
                  {verification?.label ?? "Conta conectada"}
                </Badge>
              ) : null}
            </div>
            <p className="text-muted-foreground text-xs">@{partner.username}</p>
          </div>
        </div>

        <div className="text-right">
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            {Math.round(match.score)}% match
          </Badge>
        </div>
      </div>

      <MatchPartnerDetails partner={partner} gameSlug={match.game_slug} />

      <div className="flex gap-3">
        <Button
          className="flex-1 bg-gradient-primary hover:shadow-glow-primary text-primary-foreground transition-all duration-300"
          disabled={isInviting}
          onClick={async () => {
            setIsInviting(true);
            try {
              await sendDuoInvite(match.id);
              CustomToast.success(`Convite enviado para @${partner.username}!`);
              onInviteSent?.();
            } catch (error) {
              CustomToast.error(
                error instanceof Error
                  ? error.message
                  : "Não foi possível enviar o convite.",
              );
            } finally {
              setIsInviting(false);
            }
          }}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isInviting ? "Enviando..." : "Chamar para duo"}
        </Button>
      </div>
    </div>
  );
}

const PLAY_TIME_META: Record<
  string,
  { label: string; Icon: typeof Sunrise; iconClass: string }
> = {
  morning: { label: "Manhã", Icon: Sunrise, iconClass: "text-amber-400" },
  afternoon: { label: "Tarde", Icon: Sun, iconClass: "text-yellow-400" },
  evening: { label: "Noite", Icon: Sunset, iconClass: "text-orange-400" },
  night: { label: "Madrugada", Icon: Moon, iconClass: "text-violet-400" },
};

function PlayTimeChip({ slotId }: { slotId: string }) {
  const meta = PLAY_TIME_META[slotId];
  if (!meta) {
    return (
      <span className="text-xs text-muted-foreground capitalize">{slotId}</span>
    );
  }
  const Icon = meta.Icon;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/40 px-2 py-1 text-xs text-card-foreground border border-border/40">
      <Icon className={`h-3.5 w-3.5 shrink-0 ${meta.iconClass}`} />
      {meta.label}
    </span>
  );
}

function SelectionOverflowBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground">
      +{count}
    </span>
  );
}

function CollapsedAnyLabel({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-border/50 bg-muted/50 px-2 py-0.5 text-[11px] font-medium leading-none text-card-foreground">
      {label}
    </span>
  );
}

function CollapsedLolTierList({ tiers }: { tiers: string[] }) {
  const collapsed = collapseSelection(tiers, ranks, "Todos os elos");
  if (collapsed.kind === "all") {
    return <CollapsedAnyLabel label={collapsed.label} />;
  }
  return (
    <>
      {collapsed.items.map((tier) => (
        <LolTierBadge key={tier} tier={tier} />
      ))}
      {collapsed.overflow > 0 ? <SelectionOverflowBadge count={collapsed.overflow} /> : null}
    </>
  );
}

function CollapsedValorantTierList({ tiers }: { tiers: string[] }) {
  const collapsed = collapseSelection(tiers, VAL_TIERS, "Todos os elos");
  if (collapsed.kind === "all") {
    return <CollapsedAnyLabel label={collapsed.label} />;
  }
  return (
    <>
      {collapsed.items.map((tier) => (
        <ValorantTierBadge key={tier} tier={tier} />
      ))}
      {collapsed.overflow > 0 ? <SelectionOverflowBadge count={collapsed.overflow} /> : null}
    </>
  );
}

function CollapsedPremierRangeList({ ranges }: { ranges: string[] }) {
  const collapsed = collapseSelection(ranges, PREMIER_RANGES, "Todas as faixas");
  if (collapsed.kind === "all") {
    return <CollapsedAnyLabel label={collapsed.label} />;
  }
  return (
    <>
      {collapsed.items.map((range) => (
        <PremierRangeBadge key={range} range={range} />
      ))}
      {collapsed.overflow > 0 ? <SelectionOverflowBadge count={collapsed.overflow} /> : null}
    </>
  );
}

function LolTierBadge({ tier }: { tier: string }) {
  const emblem = lolTierEmblemUrl(tier);
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 py-0.5">
      {emblem ? <RankEmblemBadge src={emblem} alt="" zoomPercent={168} /> : null}
      <span className="whitespace-nowrap text-[11px] font-medium leading-none text-card-foreground">
        {tier}
      </span>
    </span>
  );
}

function ValorantTierBadge({ tier }: { tier: string }) {
  const emblem = valorantTierEmblemUrl(tier);
  const tierColor = VAL_RANK_COLORS[tier] ?? "text-card-foreground";
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded border border-border/50 bg-muted/50 py-1 pl-1 pr-1.5">
      {emblem ? <RankEmblemBadge src={emblem} alt="" zoomPercent={150} /> : null}
      <span className={`whitespace-nowrap text-[11px] font-medium leading-none ${tierColor}`}>
        {tier}
      </span>
    </span>
  );
}

function PremierRangeBadge({ range }: { range: string }) {
  const style = premierRangeStyle(range);
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none ${premierRangeChipClass(range, true)}`}
    >
      {style ? <span className={`h-2 w-2 rounded-full ${style.dot}`} aria-hidden /> : null}
      {range}
    </span>
  );
}

function PremierRangeRow({ label, range }: { label: string; range: string }) {
  return (
    <div className="grid grid-cols-[auto,minmax(0,1fr)] items-start gap-x-3 text-sm">
      <span className="text-muted-foreground leading-5">{label}</span>
      <span className="flex justify-end">
        <PremierRangeBadge range={range} />
      </span>
    </div>
  );
}

function ValorantEloRow({ label, tier }: { label: string; tier: string }) {
  return (
    <div className="w-full min-w-0 space-y-1.5 text-sm">
      <p className="text-muted-foreground leading-5">{label}</p>
      <div className="flex w-full max-w-full flex-wrap content-start justify-start gap-1.5">
        <ValorantTierBadge tier={tier} />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valuePrefix,
  valueClassName,
}: {
  label: string;
  value: string;
  valuePrefix?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[auto,minmax(0,1fr)] items-start gap-x-3 text-sm">
      <span className="text-muted-foreground leading-5">{label}</span>
      <span className="flex items-start justify-end gap-2 text-right">
        {valuePrefix ? <span className="shrink-0 pt-0.5">{valuePrefix}</span> : null}
        <span
          className={`break-words font-medium leading-5 text-card-foreground ${valueClassName ?? ""}`}
        >
          {value}
        </span>
      </span>
    </div>
  );
}


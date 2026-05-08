"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
} from "lucide-react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { useDuoSocket } from "../../hooks/useDuoSocket";
import { useLiveExpiryLabel } from "../../hooks/useLiveExpiryLabel";
import { getActiveQueues } from "../../services/duoApi";
import { usePresenceContext } from "@/context/PresenceContext";
import { LolRankEmblemFrame } from "@/components/lol/LolRankEmblemFrame";
import { LolLaneRoleIcon } from "@/components/lol/LolLaneRoleIcon";
import { lolTierEmblemUrl } from "@/lib/lolRankedEmblem";
import type { DuoMatch, Game, GamePreferences } from "../../types/duo";

interface MatchResultsProps {
  game: Game;
  preferences: Partial<GamePreferences>;
  /** Mesmo destino que «Editar preferências» em manage-queue: fluxo a partir da verificação do perfil. */
  onEditFilters: () => void;
  /** Fila expirou (TTL) — voltar ao passo de preferências avançadas. */
  onQueueExpired: () => void;
  /** Volta à escolha de jogos (lista inicial do Duo Finder). */
  onChooseGame: () => void;
}

type FilterMode = "all" | "online";

const PATIENT_SEARCH_MS = 50_000;
const CS2_ROLE_OPTIONS = ["AWPer", "Entry", "Second Entry", "Support", "Lurker", "IGL"] as const;
const CS2_PREMIER_RANGE_OPTIONS = [
  "0-4999",
  "5000-9999",
  "10000-14999",
  "15000-19999",
  "20000-24999",
  "25000-29999",
  "30000+",
] as const;

function partnerLooksActive(status: string) {
  return status === "online" || status === "away" || status === "dnd";
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
  onEditFilters,
  onQueueExpired,
  onChooseGame,
}: MatchResultsProps) {
  const slug = game.acronym.toLowerCase();
  const { getPresence } = usePresenceContext();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  /** Começa em true para não exibir o vazio «ninguém encontrado» antes do primeiro start_search. */
  const [searching, setSearching] = useState(true);
  const [searchPhase, setSearchPhase] = useState<"active" | "patient">("active");
  const prefsSignature = useMemo(
    () => JSON.stringify(preferences ?? {}),
    [preferences]
  );
  const lastSentPrefsSigRef = useRef<string | null>(null);
  const expiryNavigateRef = useRef(false);

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
  } = useDuoSocket({ gameSlug: slug, enabled: true });

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

  const displayedMatches: DuoMatch[] =
    filterMode === "online"
      ? matches.filter((m) =>
          partnerLooksActive(getPresence(m.partner.user_id).status),
        )
      : matches;

  const sortedMatches = [...displayedMatches].sort((a, b) => b.score - a.score);

  const bootstrapping = queueStatus === null && !error;

  return (
    <div className="min-h-layout-main w-full max-w-full py-8 px-4">
      <div className="w-full max-w-5xl mx-auto animate-slide-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-12">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">{game.name} – Duos</h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
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

          <div className="flex items-center space-x-2">
            {connected ? (
              <Wifi className="w-4 h-4 text-neon-green" />
            ) : (
              <WifiOff className="w-4 h-4 text-muted-foreground" />
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
          <div className="card-glass rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Na fila{" "}
                {liveExpiryLabel ? `· Expira em ${liveExpiryLabel}` : null}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-border"
                onClick={onEditFilters}
              >
                <SlidersHorizontal className="w-3 h-3 mr-1" />
                Mudar filtros
              </Button>
              {isNearExpiry && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                  onClick={renewQueue}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Renovar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={leaveQueue}
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
        <div className="flex space-x-2 mb-6">
          {(["all", "online"] as FilterMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterMode === mode
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {mode === "all" ? (
                <>
                  <Users className="w-4 h-4 inline-block mr-1" />
                  Todos
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-neon-green rounded-full inline-block mr-1" />
                  Online
                </>
              )}
            </button>
          ))}
        </div>

        {/* Estado inicial: evita overlay «ninguém encontrado» antes do WebSocket / fila */}
        {bootstrapping && matches.length === 0 && (
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
        {!bootstrapping && searching && matches.length === 0 && (
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
        {sortedMatches.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {sortedMatches.map((match, index) => (
              <MatchCard
                key={`${match.id}-${match.partner.user_id}`}
                match={match}
                index={index}
              />
            ))}
          </div>
        )}

        {/* No results (and not searching) */}
        {!bootstrapping &&
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

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, index }: { match: DuoMatch; index: number }) {
  const partner = match.partner;
  const prefs = partner.preferences as Record<string, any>;
  const slug = match.game_slug;
  const gs = (partner.game_stats ?? {}) as Record<string, any>;

  const displayName = partner.first_name
    ? `${partner.first_name} ${partner.last_name}`.trim()
    : partner.username;

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
            <h3 className="text-lg font-bold text-card-foreground">{displayName}</h3>
            <p className="text-muted-foreground text-xs">@{partner.username}</p>
          </div>
        </div>

        <div className="text-right">
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            {Math.round(match.score)}% match
          </Badge>
        </div>
      </div>

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

      {/* Game-specific preferences summary */}
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
                {prefs.own_elo ? (
                  <InfoRow label="Elo declarado" value={prefs.own_elo} />
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
                          className="inline-flex shrink-0 items-center gap-0.5 rounded border border-border/50 bg-muted/20 px-1.5 py-0.5"
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
                      {(prefs.accepted_elo as string[]).map((tier) => {
                        const emblem = lolTierEmblemUrl(tier);
                        return (
                          <span
                            key={tier}
                            className="inline-flex shrink-0 items-center gap-1 rounded border border-border/50 bg-muted/20 px-1.5 py-0.5"
                          >
                            {emblem ? (
                              <LolRankEmblemFrame
                                src={emblem}
                                alt=""
                                frameClass="h-6 w-6 shrink-0"
                                zoomPercent={188}
                              />
                            ) : null}
                            <span className="whitespace-nowrap text-[11px] font-medium leading-none text-card-foreground">
                              {tier}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pt-3 border-t border-border/50">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Conta ranqueada (Riot)
              </p>
              <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-4">
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/30 p-2.5">
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
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/30 p-2.5">
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
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/30 p-2.5">
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
                <div className="flex min-h-[7.25rem] flex-col rounded-lg border border-border/40 bg-muted/30 p-2.5">
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
                  <InfoRow label="Faixa Premier" value={prefs.own_range} />
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
                  <InfoRow
                    label="Faixas que aceita"
                    value={summarizeSelectionList(prefs.accepted_ranges, {
                      allCount: CS2_PREMIER_RANGE_OPTIONS.length,
                      allLabel: "Todas",
                    })}
                  />
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

            <div className="pt-3 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Stats CS2
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                  <Target className="h-4 w-4 mx-auto mb-1 text-neon-green" />
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    K/D
                  </div>
                  <div className="font-semibold text-sm text-card-foreground">
                    {gs.kd != null ? String(gs.kd) : "Sem estatísticas"}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                  <Crosshair className="h-4 w-4 mx-auto mb-1 text-sky-400" />
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    HS%
                  </div>
                  <div className="font-semibold text-sm text-card-foreground">
                    {gs.hs_percent != null ? `${gs.hs_percent}%` : "Sem estatísticas"}
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
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
          </>
        )}

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

      {/* Actions */}
      <div className="flex space-x-3">
        <Button
          className="flex-1 bg-gradient-primary hover:shadow-glow-primary text-primary-foreground transition-all duration-300"
          onClick={() => (window.location.href = `/messages?user=${partner.username}`)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Mensagem
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

function InfoRow({
  label,
  value,
  valuePrefix,
}: {
  label: string;
  value: string;
  valuePrefix?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto,minmax(0,1fr)] items-start gap-x-3 text-sm">
      <span className="text-muted-foreground leading-5">{label}</span>
      <span className="flex items-start justify-end gap-2 text-right">
        {valuePrefix ? <span className="shrink-0 pt-0.5">{valuePrefix}</span> : null}
        <span className="break-words font-medium leading-5 text-card-foreground">{value}</span>
      </span>
    </div>
  );
}


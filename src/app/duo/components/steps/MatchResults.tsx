"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  Target,
  Crosshair,
  Timer,
  Sunrise,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
import { useDuoSocket } from "../../hooks/useDuoSocket";
import type { DuoMatch, Game, GamePreferences } from "../../types/duo";

interface MatchResultsProps {
  game: Game;
  preferences: Partial<GamePreferences>;
  onBack: () => void;
  /** Volta à escolha de jogos (lista inicial do Duo Finder). */
  onChooseGame: () => void;
}

type FilterMode = "all" | "online";

const PATIENT_SEARCH_MS = 50_000;

export function MatchResults({ game, preferences, onBack, onChooseGame }: MatchResultsProps) {
  const slug = game.acronym.toLowerCase();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searching, setSearching] = useState(false);
  const [searchPhase, setSearchPhase] = useState<"active" | "patient">("active");
  const prefsSignature = useMemo(
    () => JSON.stringify(preferences ?? {}),
    [preferences]
  );
  const lastSentPrefsSigRef = useRef<string | null>(null);

  const {
    connected,
    queueStatus,
    expiresAt,
    isNearExpiry,
    matches,
    error,
    startSearch,
    leaveQueue,
    renewQueue,
    pulseDuoResultsPresence,
  } = useDuoSocket({ gameSlug: slug, enabled: true });

  useEffect(() => {
    if (!connected) {
      lastSentPrefsSigRef.current = null;
    }
  }, [connected]);

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
      ? matches // real online status requires further integration – show all for now
      : matches;

  const sortedMatches = [...displayedMatches].sort((a, b) => b.score - a.score);

  // Format expiry countdown
  const expiryLabel = expiresAt
    ? formatExpiry(expiresAt)
    : null;

  return (
    <div className="min-h-screen w-screen py-8 px-4">
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
        {(queueStatus === "in_queue" || queueStatus === "searching") && (
          <div className="card-glass rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Na fila {expiryLabel && `· Expira ${expiryLabel}`}
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-border"
                onClick={onBack}
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

        {queueStatus === "evicted" && (
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

        {/* Searching indicator */}
        {searching && matches.length === 0 && (
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
        {!searching && sortedMatches.length === 0 && queueStatus !== "evicted" && (
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

  const photoSrc = resolveGameMediaUrl(partner.profile_photo);

  return (
    <div
      className="card-glass bg-[#0F172A] rounded-xl p-6 animate-fade-in-scale hover:scale-[1.02] transition-all duration-300"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={displayName}
                className="w-14 h-14 rounded-full border-2 border-primary/30 object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-primary/30 bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
                {(partner.first_name || partner.username)[0]?.toUpperCase()}
              </div>
            )}
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

      {/* Game-specific preferences summary */}
      <div className="space-y-4 mb-5">
        {slug === "lol" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0">
            <div className="space-y-2 sm:pr-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                Dele
              </p>
              {prefs.main_role ? (
                <InfoRow label="Lane principal" value={prefs.main_role} />
              ) : null}
              {prefs.secondary_role ? (
                <InfoRow label="Lane secundária" value={prefs.secondary_role} />
              ) : null}
              {prefs.own_elo ? (
                <InfoRow label="Elo" value={prefs.own_elo} />
              ) : null}
            </div>
            <div className="space-y-2 sm:border-l sm:border-border/60 sm:pl-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                O que procura
              </p>
              {prefs.desired_roles?.length > 0 ? (
                <InfoRow
                  label="Lanes no duo"
                  value={prefs.desired_roles.join(", ")}
                />
              ) : null}
              {prefs.accepted_elo?.length > 0 ? (
                <InfoRow
                  label="Elos que aceita"
                  value={prefs.accepted_elo.join(", ")}
                />
              ) : null}
            </div>
          </div>
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
                  <InfoRow label="Funções" value={prefs.roles.join(", ")} />
                ) : null}
                {prefs.favorite_weapons?.length > 0 ? (
                  <InfoRow
                    label="Armas favoritas"
                    value={prefs.favorite_weapons.join(", ")}
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
                    value={prefs.accepted_ranges.join(", ")}
                  />
                ) : null}
                {prefs.desired_roles?.length > 0 ? (
                  <InfoRow
                    label="Funções no duo"
                    value={prefs.desired_roles.join(", ")}
                  />
                ) : null}
              </div>
            </div>

            {gs.kd != null || gs.hours_played != null || gs.hs_percent != null ? (
              <div className="pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Stats CS2
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {gs.kd != null ? (
                    <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                      <Target className="h-4 w-4 mx-auto mb-1 text-neon-green" />
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        K/D
                      </div>
                      <div className="font-semibold text-sm text-card-foreground">
                        {String(gs.kd)}
                      </div>
                    </div>
                  ) : null}
                  {gs.hs_percent != null ? (
                    <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                      <Crosshair className="h-4 w-4 mx-auto mb-1 text-sky-400" />
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        HS%
                      </div>
                      <div className="font-semibold text-sm text-card-foreground">
                        {gs.hs_percent}%
                      </div>
                    </div>
                  ) : null}
                  {gs.hours_played != null ? (
                    <div className="rounded-lg bg-muted/30 border border-border/40 p-2.5 text-center">
                      <Timer className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                      <div className="text-[10px] text-muted-foreground leading-tight">
                        Tempo no jogo
                      </div>
                      <div className="font-semibold text-sm text-card-foreground">
                        {gs.hours_played} h
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-card-foreground font-medium">{value}</span>
    </div>
  );
}

function formatExpiry(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  if (diff <= 0) return "agora";
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 0) return `em ${hours}h ${minutes}m`;
  return `em ${minutes}m`;
}

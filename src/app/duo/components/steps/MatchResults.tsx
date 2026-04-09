"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  RefreshCw,
  Trophy,
  Users,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useDuoSocket } from "../../hooks/useDuoSocket";
import type { DuoMatch, Game, GamePreferences } from "../../types/duo";
import { enterQueue } from "../../services/duoApi";

interface MatchResultsProps {
  game: Game;
  preferences: Partial<GamePreferences>;
  onBack: () => void;
}

type FilterMode = "all" | "online";

export function MatchResults({ game, preferences, onBack }: MatchResultsProps) {
  const slug = game.acronym.toLowerCase();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [searching, setSearching] = useState(false);
  const hasStarted = useRef(false);

  const { connected, queueStatus, expiresAt, isNearExpiry, matches, error, startSearch, leaveQueue, renewQueue } =
    useDuoSocket({ gameSlug: slug, enabled: true });

  // On mount: start search via WS once connected
  useEffect(() => {
    if (connected && !hasStarted.current) {
      hasStarted.current = true;
      setSearching(true);
      startSearch(preferences);
    }
  }, [connected, preferences, startSearch]);

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
            <p className="text-muted-foreground mt-1">
              {sortedMatches.length > 0
                ? `${sortedMatches.length} parceiro${sortedMatches.length !== 1 ? "s" : ""} compatível${sortedMatches.length !== 1 ? "s" : ""}`
                : "Buscando parceiros..."}
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
            <div className="flex items-center space-x-2">
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
              onClick={() => { hasStarted.current = false; startSearch(preferences); }}
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
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
              <div className="w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin absolute inset-0" />
            </div>
            <p className="text-muted-foreground">Buscando parceiros compatíveis...</p>
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
        <div className="flex justify-center space-x-4 mb-16">
          <Button
            variant="outline"
            className="px-8 py-3 text-muted-foreground border-border hover:border-primary/50 hover:text-primary transition-all duration-300"
            onClick={onBack}
          >
            Voltar aos filtros
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Match Card ───────────────────────────────────────────────────────────────

function MatchCard({ match, index }: { match: DuoMatch; index: number }) {
  const partner = match.partner;
  const prefs = partner.preferences as any;
  const slug = match.game_slug;

  const displayName = partner.first_name
    ? `${partner.first_name} ${partner.last_name}`.trim()
    : partner.username;

  return (
    <div
      className="card-glass bg-[#0F172A] rounded-xl p-6 animate-fade-in-scale hover:scale-[1.02] transition-all duration-300"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {partner.profile_photo ? (
              <img
                src={partner.profile_photo}
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
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 mb-1">
            {Math.round(match.score)}% Match
          </Badge>
        </div>
      </div>

      {/* Game-specific preferences summary */}
      <div className="space-y-2 mb-5">
        {slug === "lol" && (
          <>
            {prefs.main_role && (
              <InfoRow label="Lane principal" value={prefs.main_role} />
            )}
            {prefs.desired_roles?.length > 0 && (
              <InfoRow label="Busca parceiro em" value={prefs.desired_roles.join(", ")} />
            )}
            {prefs.own_elo && (
              <InfoRow label="Elo" value={prefs.own_elo} />
            )}
          </>
        )}

        {slug === "cs2" && (
          <>
            {prefs.own_range && (
              <InfoRow label="Premier" value={prefs.own_range} />
            )}
            {prefs.roles?.length > 0 && (
              <InfoRow label="Funções" value={prefs.roles.join(", ")} />
            )}
            {prefs.favorite_weapons?.length > 0 && (
              <InfoRow label="Armas" value={prefs.favorite_weapons.join(", ")} />
            )}
          </>
        )}

        {prefs.play_times?.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {prefs.play_times
                .map((t: string) => ({ morning: "Manhã", afternoon: "Tarde", evening: "Noite", night: "Madrugada" }[t] ?? t))
                .join(", ")}
            </span>
          </div>
        )}
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

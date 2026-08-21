"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import type {
  Game,
  GamePreferences,
  GameSchema,
  GameStats,
  LolStats,
  CsStats,
  ValorantStats,
} from "../../types/duo";
import { getGameSchema, getGameStats } from "../../services/duoApi";
import { LolProfile } from "../game/LolProfile";
import { LolSelfDeclaredProfile } from "../game/LolSelfDeclaredProfile";
import { CsProfile } from "../game/CsProfile";
import { ValorantProfile } from "../game/ValorantProfile";
import { isValorantDuoSlug } from "../../utils/isValorantGame";

interface GameVerificationProps {
  game: Game;
  /** Preferências já salvas (ex.: ao reeditar de uma fila ativa). */
  initialPreferences?: Partial<GamePreferences>;
  onReady: (
    stats: GameStats,
    schema: GameSchema,
    verifyPreferences: Partial<GamePreferences>
  ) => void;
  onBack: () => void;
}

function isSelfDeclaredStats(stats: GameStats | null): stats is ValorantStats {
  return Boolean(stats && "self_declared" in stats && stats.self_declared);
}

function extractLolTier(rank: string | null | undefined): string {
  if (!rank) return "";
  return rank.split(" ")[0]?.trim() ?? "";
}

export function GameVerification({
  game,
  initialPreferences,
  onReady,
  onBack,
}: GameVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountLinked, setAccountLinked] = useState<boolean | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [schema, setSchema] = useState<GameSchema | null>(null);

  const slug = game.acronym.toLowerCase();
  const isValorant = isValorantDuoSlug(slug);
  const isSelfDeclaredFlow = isValorant || accountLinked === false;

  const [lolMainRole, setLolMainRole] = useState("Mid");
  const [lolSecondaryRole, setLolSecondaryRole] = useState("Support");
  const [lolOwnElo, setLolOwnElo] = useState("");

  const [csRoles, setCsRoles] = useState<string[]>([]);
  const [csWeapons, setCsWeapons] = useState<string[]>([]);
  const [csOwnRange, setCsOwnRange] = useState("");

  const [valOwnElo, setValOwnElo] = useState("");
  const [valRoles, setValRoles] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setAccountLinked(null);
    setStats(null);
    setSchema(null);

    Promise.all([getGameStats(slug), getGameSchema(slug)])
      .then(([statsRes, schemaRes]) => {
        setAccountLinked(statsRes.connected);
        setStats(statsRes.stats);
        setSchema(schemaRes);
      })
      .catch(() => setError("Erro ao carregar dados do jogo."))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const p = initialPreferences as Record<string, unknown> | undefined;
    if (!p || typeof p !== "object") return;
    if (slug === "lol") {
      if (typeof p.main_role === "string" && p.main_role) setLolMainRole(p.main_role);
      if (typeof p.secondary_role === "string" && p.secondary_role)
        setLolSecondaryRole(p.secondary_role);
      if (typeof p.own_elo === "string" && p.own_elo) setLolOwnElo(p.own_elo);
    }
    if (slug === "cs2") {
      if (Array.isArray(p.roles)) setCsRoles(p.roles as string[]);
      if (Array.isArray(p.favorite_weapons))
        setCsWeapons(p.favorite_weapons as string[]);
      if (typeof p.own_range === "string" && p.own_range) setCsOwnRange(p.own_range);
    }
    if (isValorant) {
      if (typeof p.own_elo === "string" && p.own_elo) setValOwnElo(p.own_elo);
      if (Array.isArray(p.roles)) setValRoles(p.roles as string[]);
    }
  }, [slug, isValorant, initialPreferences]);

  function buildPreferences(): Partial<GamePreferences> {
    if (slug === "lol") {
      const linkedStats = !isSelfDeclaredFlow && stats ? (stats as LolStats) : null;
      return {
        main_role: lolMainRole,
        secondary_role: lolSecondaryRole,
        own_elo: linkedStats
          ? extractLolTier(linkedStats.rank) || lolOwnElo
          : lolOwnElo,
      } as Partial<GamePreferences>;
    }
    if (slug === "cs2") {
      return {
        own_range: csOwnRange,
        favorite_weapons: csWeapons,
        roles: csRoles,
      } as Partial<GamePreferences>;
    }
    if (isValorant) {
      return {
        own_elo: valOwnElo,
        roles: valRoles,
      } as Partial<GamePreferences>;
    }
    return {};
  }

  const canContinue = (() => {
    if (isValorant) return Boolean(valOwnElo) && valRoles.length > 0;
    if (slug === "lol" && isSelfDeclaredFlow) {
      return Boolean(lolOwnElo) && Boolean(lolMainRole) && Boolean(lolSecondaryRole);
    }
    if (slug === "cs2" && isSelfDeclaredFlow) {
      return Boolean(csOwnRange) && csRoles.length > 0;
    }
    return true;
  })();

  function handleContinue() {
    if (!stats || !schema || !canContinue) return;
    onReady(stats, schema, buildPreferences());
  }

  const profileDescription = isSelfDeclaredFlow
    ? "Informe seu perfil antes de buscar um duo."
    : "Confira os dados da sua conta e ajuste o que for preciso antes de buscar um duo.";

  return (
    <div className="min-h-layout-main w-full max-w-full flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl animate-slide-in-up">
        <button
          type="button"
          onClick={onBack}
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border/80 hover:bg-muted/60 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Escolher outro jogo
        </button>

        {!loading && !error && stats ? (
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow-primary" aria-hidden />
              Passo 1 · Seu perfil
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
              {game.name}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
              {profileDescription}
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/35 bg-destructive/5 p-8 text-center backdrop-blur-sm">
            <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-destructive" />
            <p className="font-medium text-destructive">{error}</p>
            <Button variant="outline" className="mt-5 rounded-xl border-border/80" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : null}

        {!loading && !error && stats && schema ? (
          <div className="space-y-6">
            {accountLinked && !isValorant ? (
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-4 py-3 text-emerald-400">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20">
                  <CheckCircle className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">Conta conectada</span>
              </div>
            ) : null}

            {slug === "lol" && accountLinked && !isSelfDeclaredStats(stats) ? (
              <LolProfile
                stats={stats as LolStats}
                mainRole={lolMainRole}
                secondaryRole={lolSecondaryRole}
                onMainRoleChange={setLolMainRole}
                onSecondaryRoleChange={setLolSecondaryRole}
              />
            ) : null}

            {slug === "lol" && isSelfDeclaredFlow ? (
              <LolSelfDeclaredProfile
                gameIcon={game.icon}
                gameName={game.name}
                ownElo={lolOwnElo}
                mainRole={lolMainRole}
                secondaryRole={lolSecondaryRole}
                onEloChange={setLolOwnElo}
                onMainRoleChange={setLolMainRole}
                onSecondaryRoleChange={setLolSecondaryRole}
              />
            ) : null}

            {slug === "cs2" ? (
              <CsProfile
                gameIcon={game.icon}
                gameName={game.name}
                stats={accountLinked && !isSelfDeclaredStats(stats) ? (stats as CsStats) : null}
                selfDeclared={isSelfDeclaredFlow}
                selectedRoles={csRoles}
                selectedWeapons={csWeapons}
                ownRange={csOwnRange}
                onRolesChange={setCsRoles}
                onWeaponsChange={setCsWeapons}
                onRangeChange={setCsOwnRange}
              />
            ) : null}

            {isValorant ? (
              <ValorantProfile
                gameIcon={game.icon}
                gameName={game.name}
                ownElo={valOwnElo}
                selectedRoles={valRoles}
                onEloChange={setValOwnElo}
                onRolesChange={setValRoles}
              />
            ) : null}

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="h-12 min-w-[12rem] rounded-xl bg-gradient-primary px-12 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-primary disabled:pointer-events-none disabled:opacity-45"
              >
                Continuar
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

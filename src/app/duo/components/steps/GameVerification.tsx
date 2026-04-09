"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import type { Game, GamePreferences, GameSchema, GameStats, LolStats, CsStats } from "../../types/duo";
import { getGameSchema, getGameStats } from "../../services/duoApi";
import { LolProfile } from "../game/LolProfile";
import { CsProfile } from "../game/CsProfile";

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

export function GameVerification({
  game,
  initialPreferences,
  onReady,
  onBack,
}: GameVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [schema, setSchema] = useState<GameSchema | null>(null);

  const slug = game.acronym.toLowerCase();

  // Editable LoL fields
  const [lolMainRole, setLolMainRole] = useState("Mid");
  const [lolSecondaryRole, setLolSecondaryRole] = useState("Support");

  // Editable CS fields
  const [csRoles, setCsRoles] = useState<string[]>([]);
  const [csWeapons, setCsWeapons] = useState<string[]>([]);
  const [csOwnRange, setCsOwnRange] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setConnected(null);
    setStats(null);
    setSchema(null);

    Promise.all([getGameStats(slug), getGameSchema(slug)])
      .then(([statsRes, schemaRes]) => {
        setConnected(statsRes.connected);
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
    }
    if (slug === "cs2") {
      if (Array.isArray(p.roles)) setCsRoles(p.roles as string[]);
      if (Array.isArray(p.favorite_weapons))
        setCsWeapons(p.favorite_weapons as string[]);
      if (typeof p.own_range === "string" && p.own_range) setCsOwnRange(p.own_range);
    }
  }, [slug, initialPreferences]);

  function buildPreferences(): Partial<GamePreferences> {
    if (slug === "lol") {
      return {
        main_role: lolMainRole,
        secondary_role: lolSecondaryRole,
      } as any;
    }
    if (slug === "cs2") {
      return {
        own_range: csOwnRange,
        favorite_weapons: csWeapons,
        roles: csRoles,
      } as any;
    }
    return {};
  }

  function handleContinue() {
    if (!stats || !schema) return;
    onReady(stats, schema, buildPreferences());
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl animate-slide-in-up">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Escolher outro jogo</span>
        </button>

        {/* Header — oculto quando a conta do jogo não está conectada */}
        {(loading || error || connected !== false) && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-card-foreground mb-2">{game.name}</h1>
            <p className="text-muted-foreground">Verifique seus dados antes de entrar na fila</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-glass rounded-xl p-6 text-center border-destructive/30">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-3" />
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Not connected */}
        {!loading && !error && connected === false && (
          <div className="card-glass rounded-xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-card-foreground mb-2">
              Conta não conectada
            </h2>
            <p className="text-muted-foreground mb-6">
              Você precisa conectar sua conta de{" "}
              <span className="text-primary font-medium">{game.name}</span> para usar o
              Duo Finder.
            </p>
            <Button
              onClick={() => (window.location.href = "/profile/biblioteca")}
              className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground"
            >
              Conectar conta
            </Button>
          </div>
        )}

        {/* Connected – show stats */}
        {!loading && !error && connected === true && stats && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-neon-green mb-2">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Conta conectada</span>
            </div>

            {slug === "lol" && (
              <LolProfile
                stats={stats as LolStats}
                mainRole={lolMainRole}
                secondaryRole={lolSecondaryRole}
                onMainRoleChange={setLolMainRole}
                onSecondaryRoleChange={setLolSecondaryRole}
              />
            )}

            {slug === "cs2" && (
              <CsProfile
                stats={stats as CsStats}
                selectedRoles={csRoles}
                selectedWeapons={csWeapons}
                ownRange={csOwnRange}
                onRolesChange={setCsRoles}
                onWeaponsChange={setCsWeapons}
                onRangeChange={setCsOwnRange}
              />
            )}

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleContinue}
                className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-12 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

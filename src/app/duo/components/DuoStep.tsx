"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
import type { Game, GamePreferences, GameSchema, GameStats } from "../types/duo";
import type { DuoQueue } from "../types/duo";
import { getActiveQueues } from "../services/duoApi";
import { GameSelection } from "./steps/GameSelection";
import { GameVerification } from "./steps/GameVerification";
import { RoleSelection } from "./steps/RoleSelection";
import { EloFilter } from "./steps/EloFilter";
import { MatchResults } from "./steps/MatchResults";
import { QueueManagementStep } from "./steps/QueueManagementStep";

export type DuoStep =
  | "game"
  | "manage-queue"
  | "verify"
  | "roles"
  | "filter"
  | "results";

interface SharedState {
  selectedGame: Game | null;
  stats: GameStats | null;
  schema: GameSchema | null;
  preferences: Partial<GamePreferences>;
}

export default function DuoSteps({ initialStep }: { initialStep: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepFromQuery = searchParams?.get("step");

  /**
   * O `useSearchParams()` pode ficar um frame atrás do `router.push`. O fallback
   * `|| initialStep` usa o step da *primeira* renderização do servidor (quase
   * sempre "game"), o que causa flash da lista de jogos ao ir para verify/results.
   * Mantemos o step alvo em estado até a URL coincidir.
   */
  const [pendingStep, setPendingStep] = useState<DuoStep | null>(null);

  useEffect(() => {
    if (pendingStep === null || !stepFromQuery) return;
    if (stepFromQuery === pendingStep) {
      setPendingStep(null);
    }
  }, [pendingStep, stepFromQuery]);

  const step = (
    pendingStep ??
    (stepFromQuery as DuoStep) ??
    (initialStep as DuoStep) ??
    "game"
  ) as DuoStep;

  const [shared, setShared] = useState<SharedState>({
    selectedGame: null,
    stats: null,
    schema: null,
    preferences: {},
  });
  const [activeQueueForGame, setActiveQueueForGame] = useState<DuoQueue | null>(null);
  /** Evita flash de tela errada enquanto resolve fila ativa pós-escolha do jogo. */
  const [resolvingGameSelection, setResolvingGameSelection] = useState(false);

  const changeStep = useCallback(
    (newStep: DuoStep) => {
      setPendingStep(newStep);
      router.push(`/duo?step=${newStep}`);
    },
    [router]
  );

  const onQueueExpiredToFilter = useCallback(() => changeStep("filter"), [changeStep]);

  const updateShared = useCallback(
    (patch: Partial<SharedState>) => setShared((s) => ({ ...s, ...patch })),
    []
  );

  const gameSelectionStep = (
    <GameSelection
      onSelect={(game) => {
        void (async () => {
          setResolvingGameSelection(true);
          updateShared({ selectedGame: game });
          const slug = game.acronym.toLowerCase();
          try {
            const queues = await getActiveQueues();
            const existing = queues.find(
              (q) => (q.game_slug || "").toLowerCase() === slug
            );
            if (existing) {
              setActiveQueueForGame(existing);
              changeStep("manage-queue");
            } else {
              setActiveQueueForGame(null);
              changeStep("verify");
            }
          } catch {
            setActiveQueueForGame(null);
            changeStep("verify");
          } finally {
            setResolvingGameSelection(false);
          }
        })();
      }}
    />
  );

  const renderStep = () => {
    switch (step) {
      case "game":
        return gameSelectionStep;

      case "manage-queue":
        if (!shared.selectedGame || !activeQueueForGame) return gameSelectionStep;
        return (
          <QueueManagementStep
            game={shared.selectedGame}
            queue={activeQueueForGame}
            onBack={() => {
              setActiveQueueForGame(null);
              changeStep("game");
            }}
            onQueueUpdated={(q) => setActiveQueueForGame(q)}
            onLeftQueue={() => {
              setActiveQueueForGame(null);
              updateShared({ selectedGame: null });
              changeStep("game");
            }}
            onEditPreferences={() => {
              setShared((s) => ({
                ...s,
                preferences: {
                  ...(activeQueueForGame.preferences as Partial<GamePreferences>),
                },
                stats: null,
                schema: null,
              }));
              setActiveQueueForGame(null);
              changeStep("verify");
            }}
            onGoToSearch={() => {
              setShared((s) => ({
                ...s,
                preferences: {
                  ...(activeQueueForGame.preferences as Partial<GamePreferences>),
                },
              }));
              setActiveQueueForGame(null);
              changeStep("results");
            }}
            onQueueTtlExpired={() => {
              const q = activeQueueForGame;
              if (q) {
                setShared((s) => ({
                  ...s,
                  preferences: {
                    ...(q.preferences as Partial<GamePreferences>),
                  },
                }));
              }
              setActiveQueueForGame(null);
              changeStep("filter");
            }}
          />
        );

      case "verify":
        // Guard: no game selected → fall back to game selection without calling router during render
        if (!shared.selectedGame) return gameSelectionStep;
        return (
          <GameVerification
            game={shared.selectedGame}
            initialPreferences={shared.preferences}
            onReady={(stats, schema, verifyPreferences) => {
              setShared((s) => ({
                ...s,
                stats,
                schema,
                preferences: { ...s.preferences, ...verifyPreferences },
              }));
              changeStep("roles");
            }}
            onBack={() => changeStep("game")}
          />
        );

      case "roles":
        if (!shared.selectedGame || !shared.schema) return gameSelectionStep;
        return (
          <RoleSelection
            game={shared.selectedGame}
            schema={shared.schema}
            preferences={shared.preferences}
            onNext={(prefs) => {
              updateShared({ preferences: { ...shared.preferences, ...prefs } });
              changeStep("filter");
            }}
            onBack={() => changeStep("verify")}
          />
        );

      case "filter":
        if (!shared.selectedGame || !shared.schema) return gameSelectionStep;
        return (
          <EloFilter
            game={shared.selectedGame}
            schema={shared.schema}
            preferences={shared.preferences}
            onNext={(prefs) => {
              updateShared({ preferences: { ...shared.preferences, ...prefs } });
              changeStep("results");
            }}
            onBack={() => changeStep("roles")}
          />
        );

      case "results":
        if (!shared.selectedGame) return gameSelectionStep;
        return (
          <MatchResults
            game={shared.selectedGame}
            preferences={shared.preferences}
            onEditFilters={() => {
              setShared((s) => ({
                ...s,
                stats: null,
                schema: null,
              }));
              changeStep("verify");
            }}
            onQueueExpired={onQueueExpiredToFilter}
            onChooseGame={() => {
              updateShared({ selectedGame: null });
              changeStep("game");
            }}
          />
        );

      default:
        return gameSelectionStep;
    }
  };

  return (
    <div className="min-h-layout-main bg-gradient-background relative">
      {resolvingGameSelection ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando sua fila…</p>
        </div>
      ) : null}
      <div className="lg:ml-20">{renderStep()}</div>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useCallback } from "react";
import type { Game, GamePreferences, GameSchema, GameStats } from "../types/duo";
import { GameSelection } from "./steps/GameSelection";
import { GameVerification } from "./steps/GameVerification";
import { RoleSelection } from "./steps/RoleSelection";
import { EloFilter } from "./steps/EloFilter";
import { MatchResults } from "./steps/MatchResults";

export type DuoStep =
  | "game"
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
  const step = (searchParams?.get("step") || initialStep) as DuoStep;

  const [shared, setShared] = useState<SharedState>({
    selectedGame: null,
    stats: null,
    schema: null,
    preferences: {},
  });

  const changeStep = useCallback(
    (newStep: DuoStep) => {
      router.push(`?step=${newStep}`);
    },
    [router]
  );

  const updateShared = useCallback(
    (patch: Partial<SharedState>) => setShared((s) => ({ ...s, ...patch })),
    []
  );

  const gameSelectionStep = (
    <GameSelection
      onSelect={(game) => {
        updateShared({ selectedGame: game });
        changeStep("verify");
      }}
    />
  );

  const renderStep = () => {
    switch (step) {
      case "game":
        return gameSelectionStep;

      case "verify":
        // Guard: no game selected → fall back to game selection without calling router during render
        if (!shared.selectedGame) return gameSelectionStep;
        return (
          <GameVerification
            game={shared.selectedGame}
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
            onBack={() => changeStep("filter")}
          />
        );

      default:
        return gameSelectionStep;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="ml-20">{renderStep()}</div>
    </div>
  );
}

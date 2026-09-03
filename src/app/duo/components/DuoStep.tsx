"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import type { Game, GamePreferences, GameSchema, GameStats } from "../types/duo";
import type { DuoQueue } from "../types/duo";
import {
  getActiveQueues,
  getGameSchema,
  getGameStats,
  getGames,
  leaveQueue,
} from "../services/duoApi";
import {
  clearDuoDraft,
  loadDuoDraft,
  saveDuoDraft,
} from "../utils/duoDraftStorage";
import { GameSelection } from "./steps/GameSelection";
import { GameVerification } from "./steps/GameVerification";
import { RoleSelection } from "./steps/RoleSelection";
import { EloFilter } from "./steps/EloFilter";
import { MatchResults } from "./steps/MatchResults";
import { QueueManagementStep } from "./steps/QueueManagementStep";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type DuoStep =
  | "game"
  | "manage-queue"
  | "verify"
  | "roles"
  | "filter"
  | "results";

const VALID_STEPS = new Set<DuoStep>([
  "game",
  "manage-queue",
  "verify",
  "roles",
  "filter",
  "results",
]);

interface SharedState {
  selectedGame: Game | null;
  stats: GameStats | null;
  schema: GameSchema | null;
  preferences: Partial<GamePreferences>;
}

function buildDuoUrl(step: DuoStep, gameSlug?: string | null): string {
  if (step === "game" || !gameSlug) {
    return "/duo";
  }
  const params = new URLSearchParams({
    game: gameSlug.toLowerCase(),
    step,
  });
  return `/duo?${params.toString()}`;
}

function emptyShared(): SharedState {
  return {
    selectedGame: null,
    stats: null,
    schema: null,
    preferences: {},
  };
}

function isDuoStep(value: string | null | undefined): value is DuoStep {
  return Boolean(value && VALID_STEPS.has(value as DuoStep));
}

export default function DuoSteps({
  initialStep,
  initialGame,
  initialTab,
}: {
  initialStep: string;
  initialGame?: string | null;
  initialTab?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepFromQuery = searchParams?.get("step");
  const tabFromQuery = searchParams?.get("tab") || initialTab || null;
  const gameFromQuery = (
    searchParams?.get("game") ||
    initialGame ||
    ""
  ).toLowerCase() || null;

  /**
   * O `useSearchParams()` pode ficar um frame atrás do `router.push`. O fallback
   * `|| initialStep` usa o step da *primeira* renderização do servidor (quase
   * sempre "game"), o que causa flash da lista de jogos ao ir para verify/results.
   * Mantemos o step alvo em estado até a URL coincidir.
   */
  const [pendingStep, setPendingStep] = useState<DuoStep | null>(null);
  const selectedGameSlugRef = useRef<string | null>(null);
  const preferencesRef = useRef<Partial<GamePreferences>>({});

  useEffect(() => {
    if (pendingStep === null || !stepFromQuery) return;
    if (stepFromQuery === pendingStep) {
      setPendingStep(null);
    }
  }, [pendingStep, stepFromQuery]);

  const step = (
    pendingStep ??
    (isDuoStep(stepFromQuery) ? stepFromQuery : null) ??
    (isDuoStep(initialStep) ? initialStep : null) ??
    "game"
  ) as DuoStep;

  const [shared, setShared] = useState<SharedState>(emptyShared);
  const [activeQueueForGame, setActiveQueueForGame] = useState<DuoQueue | null>(null);
  const [queueSwitchPrompt, setQueueSwitchPrompt] = useState<{
    targetGame: Game;
    activeQueue: DuoQueue;
    activeGame: Game;
  } | null>(null);
  const [queueSwitchBusy, setQueueSwitchBusy] = useState(false);
  const [resolvingGameSelection, setResolvingGameSelection] = useState(
    () => Boolean(gameFromQuery)
  );
  const [hydratingFromUrl, setHydratingFromUrl] = useState(() =>
    Boolean(gameFromQuery)
  );
  /** Evita re-hidratar a cada `changeStep` — só no F5 / deep-link / troca de jogo. */
  const hydratedSlugRef = useRef<string | null>(null);

  const persistDraft = useCallback(
    (slug: string | null | undefined, preferences: Partial<GamePreferences>) => {
      if (!slug) return;
      saveDuoDraft(slug, preferences);
    },
    []
  );

  const changeStep = useCallback(
    (newStep: DuoStep, gameSlug?: string | null) => {
      setPendingStep(newStep);
      const slug =
        gameSlug !== undefined ? gameSlug : selectedGameSlugRef.current;
      if (slug && newStep !== "game") {
        persistDraft(slug, preferencesRef.current);
      }
      router.push(buildDuoUrl(newStep, slug));
    },
    [persistDraft, router]
  );

  const resetToGameList = useCallback(() => {
    const slug = selectedGameSlugRef.current;
    if (slug) clearDuoDraft(slug);
    selectedGameSlugRef.current = null;
    preferencesRef.current = {};
    hydratedSlugRef.current = null;
    setActiveQueueForGame(null);
    setShared(emptyShared());
    changeStep("game", null);
  }, [changeStep]);

  const onQueueExpiredToFilter = useCallback(
    () => changeStep("filter"),
    [changeStep]
  );

  const updateShared = useCallback(
    (patch: Partial<SharedState>) => {
      setShared((s) => {
        const next = { ...s, ...patch };
        selectedGameSlugRef.current = next.selectedGame
          ? next.selectedGame.acronym.toLowerCase()
          : null;
        preferencesRef.current = next.preferences ?? {};
        if (selectedGameSlugRef.current) {
          saveDuoDraft(selectedGameSlugRef.current, preferencesRef.current);
        }
        return next;
      });
    },
    []
  );

  // Deep-link / F5: restaura jogo, schema, prefs e permanece no step da URL
  useEffect(() => {
    if (!gameFromQuery) {
      hydratedSlugRef.current = null;
      setHydratingFromUrl(false);
      setResolvingGameSelection(false);
      return;
    }

    // Navegação client-side no mesmo jogo: não refaz fetch
    if (
      hydratedSlugRef.current === gameFromQuery &&
      selectedGameSlugRef.current === gameFromQuery
    ) {
      setHydratingFromUrl(false);
      setResolvingGameSelection(false);
      return;
    }

    const urlStep = isDuoStep(stepFromQuery)
      ? stepFromQuery
      : isDuoStep(initialStep)
        ? initialStep
        : null;

    let cancelled = false;
    setHydratingFromUrl(true);
    setResolvingGameSelection(true);

    void (async () => {
      try {
        const [games, queues] = await Promise.all([
          getGames(),
          getActiveQueues().catch(() => [] as DuoQueue[]),
        ]);
        if (cancelled) return;

        const game = (games as Game[]).find(
          (g) => g.acronym.toLowerCase() === gameFromQuery
        );
        if (!game) {
          hydratedSlugRef.current = null;
          resetToGameList();
          return;
        }

        const existing = queues.find(
          (q) => (q.game_slug || "").toLowerCase() === gameFromQuery
        );
        // Global single-queue: if URL game differs from the active queue, open that queue instead.
        const otherActive =
          !existing && queues.length > 0 ? queues[0] : null;
        if (otherActive) {
          const otherSlug = (otherActive.game_slug || "").toLowerCase();
          const otherGame = (games as Game[]).find(
            (g) => g.acronym.toLowerCase() === otherSlug
          );
          if (otherGame) {
            const prefs = {
              ...(otherActive.preferences as Partial<GamePreferences>),
            };
            selectedGameSlugRef.current = otherSlug;
            preferencesRef.current = prefs;
            saveDuoDraft(otherSlug, prefs);
            hydratedSlugRef.current = otherSlug;
            setShared({
              selectedGame: otherGame,
              stats: null,
              schema: null,
              preferences: prefs,
            });
            setActiveQueueForGame(otherActive);
            changeStep("manage-queue", otherSlug);
            return;
          }
        }

        const draft = loadDuoDraft(gameFromQuery);
        const preferences: Partial<GamePreferences> = {
          ...(draft?.preferences ?? {}),
          ...((existing?.preferences as Partial<GamePreferences>) ?? {}),
        };

        const needsSchema =
          !urlStep ||
          urlStep === "game" ||
          urlStep === "verify" ||
          urlStep === "roles" ||
          urlStep === "filter" ||
          urlStep === "results";

        let schema: GameSchema | null = null;
        let stats: GameStats | null = null;
        if (needsSchema) {
          const [statsRes, schemaRes] = await Promise.all([
            getGameStats(gameFromQuery).catch(() => null),
            getGameSchema(gameFromQuery).catch(() => null),
          ]);
          if (cancelled) return;
          schema = schemaRes;
          stats = statsRes?.stats ?? null;
        }

        selectedGameSlugRef.current = gameFromQuery;
        preferencesRef.current = preferences;
        saveDuoDraft(gameFromQuery, preferences);
        hydratedSlugRef.current = gameFromQuery;

        setShared({
          selectedGame: game,
          stats,
          schema,
          preferences,
        });
        setActiveQueueForGame(existing ?? null);

        // Sem step na URL → primeira tela daquele jogo
        if (!urlStep || urlStep === "game") {
          changeStep(existing ? "manage-queue" : "verify", gameFromQuery);
          return;
        }

        if (urlStep === "manage-queue" && !existing) {
          changeStep("verify", gameFromQuery);
          return;
        }

        // roles/filter sem schema → verify (último recurso)
        if ((urlStep === "roles" || urlStep === "filter") && !schema) {
          changeStep("verify", gameFromQuery);
          return;
        }

        // F5 no mesmo step: garante URL canônica game+step
        if (!stepFromQuery) {
          changeStep(urlStep, gameFromQuery);
        }
      } catch {
        if (!cancelled) resetToGameList();
      } finally {
        if (!cancelled) {
          setResolvingGameSelection(false);
          setHydratingFromUrl(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Só quando o jogo da URL muda (F5 remonta o componente e roda de novo)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [gameFromQuery]);

  const selectGame = useCallback(
    (game: Game) => {
      void (async () => {
        setResolvingGameSelection(true);
        const slug = game.acronym.toLowerCase();
        try {
          const [queues, games] = await Promise.all([
            getActiveQueues(),
            getGames().catch(() => [] as Game[]),
          ]);
          const existing = queues.find(
            (q) => (q.game_slug || "").toLowerCase() === slug
          );
          if (existing) {
            selectedGameSlugRef.current = slug;
            hydratedSlugRef.current = slug;
            const prefs = {
              ...(existing.preferences as Partial<GamePreferences>),
            };
            preferencesRef.current = prefs;
            saveDuoDraft(slug, prefs);
            setActiveQueueForGame(existing);
            updateShared({
              selectedGame: game,
              preferences: prefs,
              stats: null,
              schema: null,
            });
            changeStep("manage-queue", slug);
            return;
          }

          const otherQueue = queues[0];
          if (otherQueue) {
            const otherSlug = (otherQueue.game_slug || "").toLowerCase();
            const otherGame =
              (games as Game[]).find(
                (g) => g.acronym.toLowerCase() === otherSlug
              ) ?? null;
            if (otherGame) {
              setQueueSwitchPrompt({
                targetGame: game,
                activeQueue: otherQueue,
                activeGame: otherGame,
              });
              return;
            }
          }

          selectedGameSlugRef.current = slug;
          hydratedSlugRef.current = slug;
          preferencesRef.current = {};
          setActiveQueueForGame(null);
          saveDuoDraft(slug, {});
          updateShared({
            selectedGame: game,
            preferences: {},
            stats: null,
            schema: null,
          });
          changeStep("verify", slug);
        } catch {
          selectedGameSlugRef.current = slug;
          hydratedSlugRef.current = slug;
          preferencesRef.current = {};
          setActiveQueueForGame(null);
          updateShared({
            selectedGame: game,
            preferences: {},
            stats: null,
            schema: null,
          });
          changeStep("verify", slug);
        } finally {
          setResolvingGameSelection(false);
        }
      })();
    },
    [changeStep, updateShared]
  );

  const stayOnActiveQueue = useCallback(() => {
    const prompt = queueSwitchPrompt;
    if (!prompt) return;
    const { activeQueue, activeGame } = prompt;
    const otherSlug = activeGame.acronym.toLowerCase();
    const prefs = {
      ...(activeQueue.preferences as Partial<GamePreferences>),
    };
    selectedGameSlugRef.current = otherSlug;
    hydratedSlugRef.current = otherSlug;
    preferencesRef.current = prefs;
    saveDuoDraft(otherSlug, prefs);
    setActiveQueueForGame(activeQueue);
    updateShared({
      selectedGame: activeGame,
      preferences: prefs,
      stats: null,
      schema: null,
    });
    setQueueSwitchPrompt(null);
    changeStep("manage-queue", otherSlug);
  }, [changeStep, queueSwitchPrompt, updateShared]);

  const switchToTargetGame = useCallback(() => {
    const prompt = queueSwitchPrompt;
    if (!prompt) return;
    void (async () => {
      setQueueSwitchBusy(true);
      try {
        await leaveQueue(prompt.activeQueue.id);
        const slug = prompt.targetGame.acronym.toLowerCase();
        selectedGameSlugRef.current = slug;
        hydratedSlugRef.current = slug;
        preferencesRef.current = {};
        setActiveQueueForGame(null);
        saveDuoDraft(slug, {});
        updateShared({
          selectedGame: prompt.targetGame,
          preferences: {},
          stats: null,
          schema: null,
        });
        setQueueSwitchPrompt(null);
        changeStep("verify", slug);
      } catch {
        setQueueSwitchPrompt(null);
      } finally {
        setQueueSwitchBusy(false);
      }
    })();
  }, [changeStep, queueSwitchPrompt, updateShared]);

  const gameSelectionStep = <GameSelection onSelect={selectGame} />;

  const renderStep = () => {
    if (hydratingFromUrl && gameFromQuery) {
      return null;
    }

    switch (step) {
      case "game":
        return gameSelectionStep;

      case "manage-queue":
        if (!shared.selectedGame || !activeQueueForGame) return gameSelectionStep;
        return (
          <QueueManagementStep
            game={shared.selectedGame}
            queue={activeQueueForGame}
            onBack={resetToGameList}
            onLeftQueue={resetToGameList}
            onEditPreferences={() => {
              const prefs = {
                ...(activeQueueForGame.preferences as Partial<GamePreferences>),
              };
              preferencesRef.current = prefs;
              setShared((s) => ({
                ...s,
                preferences: prefs,
                stats: null,
                schema: null,
              }));
              setActiveQueueForGame(null);
              changeStep("verify");
            }}
            onGoToSearch={() => {
              const prefs = {
                ...(activeQueueForGame.preferences as Partial<GamePreferences>),
              };
              preferencesRef.current = prefs;
              setShared((s) => ({ ...s, preferences: prefs }));
              setActiveQueueForGame(null);
              changeStep("results");
            }}
            onQueueTtlExpired={() => {
              const q = activeQueueForGame;
              if (q) {
                const prefs = {
                  ...(q.preferences as Partial<GamePreferences>),
                };
                preferencesRef.current = prefs;
                setShared((s) => ({ ...s, preferences: prefs }));
              }
              setActiveQueueForGame(null);
              changeStep("filter");
            }}
          />
        );

      case "verify":
        if (!shared.selectedGame) return gameSelectionStep;
        return (
          <GameVerification
            game={shared.selectedGame}
            initialPreferences={shared.preferences}
            onReady={(stats, schema, verifyPreferences) => {
              const preferences = {
                ...shared.preferences,
                ...verifyPreferences,
              };
              preferencesRef.current = preferences;
              setShared((s) => ({
                ...s,
                stats,
                schema,
                preferences,
              }));
              changeStep("roles");
            }}
            onBack={resetToGameList}
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
              const preferences = { ...shared.preferences, ...prefs };
              preferencesRef.current = preferences;
              updateShared({ preferences });
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
              const preferences = { ...shared.preferences, ...prefs };
              preferencesRef.current = preferences;
              updateShared({ preferences });
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
            initialTab={tabFromQuery === "requests" ? "requests" : "all"}
            onEditFilters={() => {
              setShared((s) => ({
                ...s,
                stats: null,
                schema: null,
              }));
              changeStep("verify");
            }}
            onQueueExpired={onQueueExpiredToFilter}
            onLeaveQueue={resetToGameList}
            onChooseGame={resetToGameList}
          />
        );

      default:
        return gameSelectionStep;
    }
  };

  return (
    <div className="min-h-layout-main bg-gradient-background relative">
      {resolvingGameSelection || (hydratingFromUrl && gameFromQuery) ? (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-background/85 backdrop-blur-sm"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando Duo…</p>
        </div>
      ) : null}
      <div className="lg:ml-20">{renderStep()}</div>

      <Dialog
        open={queueSwitchPrompt !== null}
        onOpenChange={(open) => {
          if (!open && !queueSwitchBusy) setQueueSwitchPrompt(null);
        }}
      >
        <DialogContent
          className="z-[100001]"
          overlayClassName="z-[100000]"
        >
          <DialogHeader>
            <DialogTitle>Trocar de fila?</DialogTitle>
            <DialogDescription>
              {queueSwitchPrompt ? (
                <>
                  Você já está na fila de{" "}
                  <strong className="text-foreground">
                    {queueSwitchPrompt.activeQueue.game_name ||
                      queueSwitchPrompt.activeGame.name}
                  </strong>
                  . Se entrar em{" "}
                  <strong className="text-foreground">
                    {queueSwitchPrompt.targetGame.name}
                  </strong>
                  , a fila atual será encerrada (incluindo convites pendentes
                  daquele jogo).
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={queueSwitchBusy}
              onClick={stayOnActiveQueue}
            >
              Ficar na fila atual
            </Button>
            <Button
              type="button"
              disabled={queueSwitchBusy}
              onClick={switchToTargetGame}
            >
              {queueSwitchBusy
                ? "Trocando…"
                : `Encerrar e buscar em ${queueSwitchPrompt?.targetGame.name ?? "outro jogo"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

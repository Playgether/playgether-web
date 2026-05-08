"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Users } from "lucide-react";
import type { Game, GamePreferences, GameSchema } from "../../types/duo";
import { LolLaneRoleIcon } from "@/components/lol/LolLaneRoleIcon";

interface RoleSelectionProps {
  game: Game;
  schema: GameSchema;
  preferences: Partial<GamePreferences>;
  onNext: (prefs: Partial<GamePreferences>) => void;
  onBack: () => void;
}

export function RoleSelection({ game, schema, preferences, onNext, onBack }: RoleSelectionProps) {
  const allRoles: string[] = (schema as any).roles ?? [];

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    (preferences as any).desired_roles ?? []
  );

  const toggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const selectAll = () => setSelectedRoles([...allRoles]);
  const clearAll = () => setSelectedRoles([]);

  const handleNext = () => {
    onNext({ desired_roles: selectedRoles } as any);
  };

  const slug = game.acronym.toLowerCase();
  const roleLabel = slug === "lol" ? "lane" : "função";

  return (
    <div className="min-h-layout-main flex w-full max-w-full items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-lg animate-slide-in-up">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            Passo 2 · Parceiro
          </span>
          <div className="mx-auto mt-5 flex max-w-md flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card text-primary">
                <Users className="h-5 w-5" />
              </span>
              <h1 className="text-balance text-xl font-bold tracking-tight text-card-foreground sm:text-2xl">
                Quais {roleLabel}s você quer no parceiro?
              </h1>
            </div>
            <p className="max-w-sm text-pretty text-sm text-muted-foreground">
              Toque na linha para marcar ou desmarcar. Várias opções permitidas.
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            {selectedRoles.length === 0
              ? `Nenhuma ${roleLabel} selecionada`
              : `${selectedRoles.length} de ${allRoles.length} selecionada${selectedRoles.length !== 1 ? "s" : ""}`}
          </p>
          <div className="flex shrink-0 gap-2">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={selectAll}
              className="h-8 rounded-lg border-border/70 px-3 text-xs font-medium"
            >
              Todos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={clearAll}
              className="h-8 rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
          </div>
        </div>

        <div className="mb-10 overflow-hidden rounded-2xl border border-border/50 bg-card/25">
          <ul className="divide-y divide-border/40" role="list">
            {allRoles.map((role) => {
              const isSelected = selectedRoles.includes(role);
              return (
                <li key={role}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={isSelected}
                    onClick={() => toggle(role)}
                    className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 ${
                      isSelected
                        ? "bg-primary/[0.07]"
                        : "hover:bg-muted/30 active:bg-muted/40"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/25 bg-transparent"
                      }`}
                      aria-hidden
                    >
                      {isSelected ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : null}
                    </span>
                    {slug === "lol" ? <LolLaneRoleIcon roleLabel={role} /> : null}
                    <span
                      className={`flex-1 text-sm font-medium sm:text-base ${
                        isSelected ? "text-foreground" : "text-card-foreground"
                      }`}
                    >
                      {role}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            type="button"
            className="order-2 h-12 rounded-xl border-border/80 px-8 text-muted-foreground hover:bg-muted/30 hover:text-foreground sm:order-1"
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={selectedRoles.length === 0}
            className="order-1 h-12 rounded-xl bg-gradient-primary px-10 font-semibold text-primary-foreground shadow-md shadow-primary/10 transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-45 sm:order-2 sm:min-w-[16rem]"
          >
            Continuar ({selectedRoles.length} selecionado{selectedRoles.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    </div>
  );
}

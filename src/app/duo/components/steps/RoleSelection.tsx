"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Users } from "lucide-react";
import type { Game, GamePreferences, GameSchema } from "../../types/duo";

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
    <div className="min-h-layout-main w-full max-w-full flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl animate-slide-in-up">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow-primary" aria-hidden />
            Passo 2 · Parceiro
          </span>
          <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-inner ring-1 ring-primary/20">
                <Users className="h-6 w-6" />
              </span>
              <h1 className="text-balance text-left text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
                Quais {roleLabel}s você quer no parceiro?
              </h1>
            </div>
            <p className="max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
              Toque para marcar ou desmarcar. Você pode escolher várias {roleLabel}s.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="h-9 rounded-full border-border/80 text-xs font-medium hover:border-primary/40 hover:bg-primary/5"
          >
            Selecionar todos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-9 rounded-full text-xs text-muted-foreground hover:bg-muted/50 hover:text-primary"
          >
            Limpar
          </Button>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {allRoles.map((role, index) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <button
                type="button"
                key={role}
                onClick={() => toggle(role)}
                className={`group relative min-h-[5.25rem] rounded-2xl border p-4 text-center transition-all duration-200 animate-fade-in-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isSelected
                    ? "border-primary/80 bg-gradient-to-b from-primary/20 to-primary/5 shadow-glow-primary ring-1 ring-primary/30"
                    : "border-border/60 bg-card/40 hover:border-primary/35 hover:bg-primary/[0.07]"
                }`}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                {isSelected ? (
                  <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                    <Check className="h-3.5 w-3.5 stroke-[3]" aria-hidden />
                  </span>
                ) : null}
                <h3
                  className={`pr-7 text-sm font-semibold leading-snug sm:text-base ${
                    isSelected ? "text-primary" : "text-card-foreground group-hover:text-primary/90"
                  }`}
                >
                  {role}
                </h3>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            className="order-2 h-12 rounded-xl border-border/80 px-8 text-muted-foreground hover:border-primary/45 hover:bg-primary/5 hover:text-primary sm:order-1"
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedRoles.length === 0}
            className="order-1 h-12 rounded-xl bg-gradient-primary px-10 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-primary disabled:pointer-events-none disabled:opacity-45 sm:order-2 sm:min-w-[16rem]"
          >
            Continuar ({selectedRoles.length} selecionado{selectedRoles.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    </div>
  );
}

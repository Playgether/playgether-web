"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
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
    <div className="min-h-screen w-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Users className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-card-foreground">
              Quais {roleLabel}s você quer no parceiro?
            </h1>
          </div>
          <p className="text-muted-foreground">
            Selecione as {roleLabel}s desejadas no seu duo
          </p>
        </div>

        {/* Select All / Clear */}
        <div className="flex justify-end space-x-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="text-xs border-border hover:border-primary/50"
          >
            Selecionar todos
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-primary"
          >
            Limpar
          </Button>
        </div>

        {/* Role Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {allRoles.map((role, index) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <button
                key={role}
                onClick={() => toggle(role)}
                className={`card-glass rounded-xl p-5 cursor-pointer transition-all duration-300 animate-fade-in-scale text-center relative ${
                  isSelected
                    ? "border-primary shadow-glow-primary bg-primary/10"
                    : "hover:border-primary/50 hover:shadow-glow-primary/50"
                }`}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <h3
                  className={`font-bold text-base ${
                    isSelected ? "text-primary" : "text-card-foreground"
                  }`}
                >
                  {role}
                </h3>

                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-glow-primary">
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            className="px-8 py-3 text-muted-foreground border-border hover:border-primary/50 hover:text-primary transition-all duration-300"
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={selectedRoles.length === 0}
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-10 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar ({selectedRoles.length} selecionado{selectedRoles.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </div>
    </div>
  );
}

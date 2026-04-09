"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter, Trophy, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Game, GamePreferences, GameSchema, LolSchema, CsSchema } from "../../types/duo";

const PLAY_TIMES = [
  { id: "morning", label: "Manhã (6h – 12h)" },
  { id: "afternoon", label: "Tarde (12h – 18h)" },
  { id: "evening", label: "Noite (18h – 00h)" },
  { id: "night", label: "Madrugada (00h – 6h)" },
] as const;

// const AGES = [];     // TEMPORARIAMENTE IGNORADO
// const SERVERS = [];  // TEMPORARIAMENTE IGNORADO

interface EloFilterProps {
  game: Game;
  schema: GameSchema;
  preferences: Partial<GamePreferences>;
  onNext: (prefs: Partial<GamePreferences>) => void;
  onBack: () => void;
}

export function EloFilter({ game, schema, preferences, onNext, onBack }: EloFilterProps) {
  const slug = game.acronym.toLowerCase();
  const isLol = slug === "lol";
  const isCs = slug === "cs2";

  // LoL: multi-select elo tiers
  const lolSchema = isLol ? (schema as LolSchema) : null;
  const [selectedElos, setSelectedElos] = useState<string[]>(
    (preferences as any).accepted_elo ?? []
  );

  // CS: multi-select premier ranges
  const csSchema = isCs ? (schema as CsSchema) : null;
  const [selectedRanges, setSelectedRanges] = useState<string[]>(
    (preferences as any).accepted_ranges ?? []
  );

  // Shared: play times
  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    (preferences as any).play_times ?? []
  );

  const toggleElo = (tier: string) =>
    setSelectedElos((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    );

  const toggleRange = (range: string) =>
    setSelectedRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );

  const toggleTime = (time: string) =>
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );

  function handleSearch() {
    const base: Partial<GamePreferences> = { play_times: selectedTimes } as any;
    if (isLol) {
      onNext({ ...base, accepted_elo: selectedElos } as any);
    } else if (isCs) {
      onNext({ ...base, accepted_ranges: selectedRanges } as any);
    } else {
      onNext(base);
    }
  }

  const eloLabel = isLol ? "Elo" : "Range de Pontos Premier";
  const eloOptions: string[] = isLol
    ? (lolSchema?.elo_tiers ?? [])
    : (csSchema?.premier_ranges ?? []);
  const selectedEloValues = isLol ? selectedElos : selectedRanges;
  const toggleEloFn = isLol ? toggleElo : toggleRange;

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Filter className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-card-foreground">
              Preferências Avançadas
            </h1>
          </div>
          <p className="text-muted-foreground">
            Refine sua busca para encontrar o parceiro ideal em {game.name}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Elo / Range filter */}
          <div className="card-glass rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-bold text-card-foreground">{eloLabel}</h3>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              {selectedEloValues.length === 0
                ? "Qualquer " + (isLol ? "elo" : "range")
                : selectedEloValues.join(", ")}
            </p>

            <Popover>
              <PopoverTrigger className="bg-input/50 border border-border rounded-lg px-4 py-2 w-full text-left focus:border-primary transition-colors flex items-center justify-between">
                <span className="text-sm">
                  {selectedEloValues.length > 0
                    ? `${selectedEloValues.length} selecionado(s)`
                    : `Selecionar ${isLol ? "elos" : "ranges"}`}
                </span>
                <svg width="16" height="16" fill="none" stroke="currentColor">
                  <path d="M4 6l4 4 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </PopoverTrigger>
              <PopoverContent className="bg-[#0F172A] border-border p-3 space-y-1 max-h-60 overflow-y-auto">
                {eloOptions.map((opt) => (
                  <div key={opt} className="flex items-center gap-2 py-1 cursor-pointer" onClick={() => toggleEloFn(opt)}>
                    <Checkbox
                      checked={selectedEloValues.includes(opt)}
                      onCheckedChange={() => toggleEloFn(opt)}
                    />
                    <span className="text-sm">{opt}</span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>

            {selectedEloValues.length > 0 && (
              <button
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={() => isLol ? setSelectedElos([]) : setSelectedRanges([])}
              >
                Limpar seleção
              </button>
            )}
          </div>

          {/* Play Time filter */}
          <div className="card-glass rounded-xl p-6 space-y-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-card-foreground">Horário</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Quando você costuma jogar?
            </p>
            <div className="space-y-2">
              {PLAY_TIMES.map(({ id, label }) => (
                <div
                  key={id}
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={() => toggleTime(id)}
                >
                  <Checkbox
                    checked={selectedTimes.includes(id)}
                    onCheckedChange={() => toggleTime(id)}
                  />
                  <span className={`text-sm transition-colors ${selectedTimes.includes(id) ? "text-primary" : "text-muted-foreground group-hover:text-card-foreground"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Idade – TEMPORARIAMENTE IGNORADO */}
          {/* <div>Faixa de idade</div> */}

          {/* Servidor – TEMPORARIAMENTE IGNORADO */}
          {/* <div>Servidor</div> */}
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
            onClick={handleSearch}
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-12 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-105"
          >
            Buscar Duo
          </Button>
        </div>
      </div>
    </div>
  );
}

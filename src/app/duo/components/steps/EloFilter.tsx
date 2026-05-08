"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Clock, Filter, MessageSquare, Trophy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Game, GamePreferences, GameSchema, LolSchema, CsSchema } from "../../types/duo";
import { lolTierEmblemUrl } from "@/lib/lolRankedEmblem";
import { LolRankEmblemFrame } from "@/components/lol/LolRankEmblemFrame";

const PLAY_TIMES = [
  { id: "morning", label: "Manhã (6h – 12h)" },
  { id: "afternoon", label: "Tarde (12h – 18h)" },
  { id: "evening", label: "Noite (18h – 00h)" },
  { id: "night", label: "Madrugada (00h – 6h)" },
] as const;

// const AGES = [];     // TEMPORARIAMENTE IGNORADO
// const SERVERS = [];  // TEMPORARIAMENTE IGNORADO

const DUO_NOTE_MAX = 240;

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

  const [duoNote, setDuoNote] = useState<string>(
    String((preferences as any).duo_note ?? "")
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
    const note = duoNote.trim().slice(0, DUO_NOTE_MAX);
    const base: Partial<GamePreferences> = {
      play_times: selectedTimes,
      duo_note: note,
    } as Partial<GamePreferences>;
    if (isLol) {
      onNext({ ...base, accepted_elo: selectedElos } as Partial<GamePreferences>);
    } else if (isCs) {
      onNext({ ...base, accepted_ranges: selectedRanges } as Partial<GamePreferences>);
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
    <div className="min-h-layout-main w-full max-w-full flex items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-3xl animate-slide-in-up">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow-primary" aria-hidden />
            Passo 3 · Preferências
          </span>
          <div className="mx-auto mt-5 flex max-w-xl flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <Filter className="h-6 w-6" />
              </span>
              <h1 className="text-balance text-left text-2xl font-bold tracking-tight text-card-foreground sm:text-3xl">
                Preferências avançadas
              </h1>
            </div>
            <p className="max-w-md text-pretty text-sm text-muted-foreground sm:text-base">
              Refine a busca em <span className="font-medium text-card-foreground">{game.name}</span> antes de ver os duos.
            </p>
          </div>
        </div>

        <div className="mb-10 grid gap-5 md:grid-cols-2 md:gap-6">
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/35 p-6 shadow-sm backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/35 before:to-transparent">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                <Trophy className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-card-foreground">{eloLabel}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedEloValues.length === 0
                    ? `Qualquer ${isLol ? "elo" : "range"} será considerado.`
                    : `${selectedEloValues.length} opção(ões) selecionada(s).`}
                </p>
              </div>
            </div>

            <Popover>
              <PopoverTrigger className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-border/80 bg-input/40 px-4 text-left text-sm font-medium text-card-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-input/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                <span className="truncate">
                  {selectedEloValues.length > 0
                    ? `${selectedEloValues.length} selecionado(s)`
                    : `Selecionar ${isLol ? "elos" : "ranges"}`}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="z-[120] max-h-60 w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-y-auto border-border p-2 shadow-lg"
              >
                {eloOptions.map((opt) => {
                  const emblem = isLol ? lolTierEmblemUrl(opt) : null;
                  return (
                    <div
                      key={opt}
                      className="flex cursor-pointer items-center gap-3 rounded-lg py-2 pl-2 pr-1 hover:bg-muted/50"
                      onClick={() => toggleEloFn(opt)}
                    >
                      <Checkbox
                        checked={selectedEloValues.includes(opt)}
                        onCheckedChange={() => toggleEloFn(opt)}
                      />
                      {emblem ? (
                        <LolRankEmblemFrame
                          src={emblem}
                          alt={`Elo ${opt}`}
                          frameClass="h-11 w-11"
                          zoomPercent={182}
                        />
                      ) : null}
                      <span className="text-sm">{opt}</span>
                    </div>
                  );
                })}
              </PopoverContent>
            </Popover>

            {selectedEloValues.length > 0 ? (
              <button
                type="button"
                className="mt-3 text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                onClick={() => (isLol ? setSelectedElos([]) : setSelectedRanges([]))}
              >
                Limpar seleção
              </button>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/35 p-6 shadow-sm backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/35 before:to-transparent">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-card-foreground">Horário</h3>
                <p className="text-xs text-muted-foreground">Quando você costuma jogar?</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLAY_TIMES.map(({ id, label }) => {
                const on = selectedTimes.includes(id);
                return (
                  <button
                    type="button"
                    key={id}
                    aria-pressed={on}
                    onClick={() => toggleTime(id)}
                    className={`rounded-full border px-3.5 py-2 text-left text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 sm:text-sm ${
                      on
                        ? "border-primary/70 bg-primary/20 text-primary shadow-glow-primary/30"
                        : "border-border/70 bg-background/40 text-muted-foreground hover:border-primary/35 hover:text-card-foreground"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Idade – TEMPORARIAMENTE IGNORADO */}
          {/* <div>Faixa de idade</div> */}

          {/* Servidor – TEMPORARIAMENTE IGNORADO */}
          {/* <div>Servidor</div> */}
        </div>

        <div className="relative mb-10 overflow-hidden rounded-2xl border border-border/60 bg-card/35 p-6 shadow-sm backdrop-blur-sm before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/35 before:to-transparent">
          <div className="mb-3 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/25">
              <MessageSquare className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-card-foreground">Recado para o duo</h3>
              <p className="text-xs text-muted-foreground">
                Opcional. Aparece para quem te encontrar (até {DUO_NOTE_MAX} caracteres).
              </p>
            </div>
          </div>
          <Textarea
            value={duoNote}
            onChange={(e) => setDuoNote(e.target.value.slice(0, DUO_NOTE_MAX))}
            placeholder='Ex.: "Procuro duo tryhard à noite" ou "Só casual e diversão"'
            className="min-h-[88px] resize-y rounded-xl border-border/80 bg-input/40 text-sm"
            maxLength={DUO_NOTE_MAX}
            aria-label="Mensagem para quem encontrar seu perfil no duo"
          />
          <p className="mt-1.5 text-right text-[10px] text-muted-foreground tabular-nums">
            {duoNote.length}/{DUO_NOTE_MAX}
          </p>
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
            onClick={handleSearch}
            className="order-1 h-12 rounded-xl bg-gradient-primary px-12 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-glow-primary sm:order-2 sm:min-w-[12rem]"
          >
            Buscar duo
          </Button>
        </div>
      </div>
    </div>
  );
}

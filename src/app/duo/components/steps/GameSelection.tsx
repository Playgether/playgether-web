"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Gamepad2, Loader2 } from "lucide-react";
import { GameMediaImage } from "@/components/media/GameMediaImage";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { GameHoverCardContent } from "@/components/pages/profile/components/GameHoverCardContent";
import type { Game } from "../../types/duo";
import { getGames } from "../../services/duoApi";

interface GameSelectionProps {
  onSelect: (game: Game) => void;
}

export function GameSelection({ onSelect }: GameSelectionProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGames()
      .then((data) => setGames(data as Game[]))
      .catch(() => setError("Não foi possível carregar os jogos."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-layout-main w-full max-w-full flex items-center justify-center p-6">
      <div className="w-full max-w-4xl animate-slide-in-up">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-card-foreground">
              Encontre seu Duo
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Escolha um jogo para começar a buscar parceiros
          </p>
        </div>

        {/* Content */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-center text-destructive">{error}</p>
        )}

        {!loading && !error && (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {games.map((game, index) => {
              const titleRow = (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {game.icon ? (
                    <GameMediaImage
                      src={game.icon}
                      alt=""
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-lg border border-border/50 bg-background/80 shadow-sm"
                      spinnerClassName="h-4 w-4"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40">
                      <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {game.name}
                  </h3>
                  <ChevronRight
                    className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-80"
                    aria-hidden
                  />
                </div>
              );

              return (
                <button
                  key={game.id}
                  type="button"
                  aria-label={`Buscar duo em ${game.name}`}
                  onClick={() => onSelect(game)}
                  className="group animate-fade-in-scale overflow-hidden rounded-2xl border border-border/55 bg-card/30 text-left shadow-sm outline-none ring-offset-background transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card/45 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-muted/60 via-muted/25 to-background">
                    <div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)_/_0.08),transparent_70%)]"
                      aria-hidden
                    />
                    <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-5">
                      {game.image ? (
                        <GameMediaImage
                          src={game.image}
                          alt=""
                          size="banner"
                          className="h-full w-full"
                          imgClassName="max-h-full max-w-full drop-shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
                          spinnerClassName="h-6 w-6"
                        />
                      ) : (
                        <Gamepad2 className="h-14 w-14 text-muted-foreground/60" />
                      )}
                    </div>
                  </div>

                  <div className="border-t border-border/45 bg-muted/15 px-4 py-3.5 backdrop-blur-[2px]">
                    {game.description ? (
                      <HoverCard openDelay={200} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <div className="w-full cursor-help text-left">{titleRow}</div>
                        </HoverCardTrigger>
                        <HoverCardContent side="top" align="start" className="z-[100] w-80">
                          <GameHoverCardContent
                            title={game.name}
                            description={game.description}
                            logo={game.icon}
                          />
                        </HoverCardContent>
                      </HoverCard>
                    ) : (
                      titleRow
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

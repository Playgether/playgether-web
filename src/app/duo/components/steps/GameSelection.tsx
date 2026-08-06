"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Gamepad2, Loader2 } from "lucide-react";
import { resolveGameMediaUrl } from "@/app/utils/getCloudinaryUrl";
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
              const coverSrc = resolveGameMediaUrl(game.image);
              const iconSrc = resolveGameMediaUrl(game.icon);
              const isValorant =
                game.acronym.toLowerCase() === "valorant" ||
                game.name.toLowerCase().includes("valorant");
              const titleRow = (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {iconSrc ? (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background/80 shadow-sm">
                      <img src={iconSrc} alt="" className="h-7 w-7 object-contain" />
                    </span>
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/40">
                      <Gamepad2 className="h-5 w-5 text-muted-foreground" />
                    </span>
                  )}
                  <h3 className="truncate text-base font-semibold tracking-tight text-card-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {game.name}
                  </h3>
                  {isValorant ? (
                    <span className="ml-auto shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
                      Em breve
                    </span>
                  ) : (
                    <ChevronRight
                      className="ml-auto h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-80"
                      aria-hidden
                    />
                  )}
                </div>
              );

              return (
                <button
                  key={game.id}
                  type="button"
                  aria-label={
                    isValorant
                      ? "VALORANT estará disponível em breve"
                      : `Buscar duo em ${game.name}`
                  }
                  disabled={isValorant}
                  onClick={() => onSelect(game)}
                  className="group animate-fade-in-scale overflow-hidden rounded-2xl border border-border/55 bg-card/30 text-left shadow-sm outline-none ring-offset-background transition-all duration-200 enabled:hover:-translate-y-0.5 enabled:hover:border-primary/35 enabled:hover:bg-card/45 enabled:hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-muted/60 via-muted/25 to-background">
                    <div
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,hsl(var(--primary)_/_0.08),transparent_70%)]"
                      aria-hidden
                    />
                    <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-5">
                      {coverSrc ? (
                        <img
                          src={coverSrc}
                          alt=""
                          decoding="async"
                          className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-[1.03]"
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
                            cover={game.image}
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

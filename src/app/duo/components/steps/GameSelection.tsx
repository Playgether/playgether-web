"use client";

import { useEffect, useState } from "react";
import { Gamepad2, Loader2 } from "lucide-react";
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => {
              const coverSrc = resolveGameMediaUrl(game.image);
              const iconSrc = resolveGameMediaUrl(game.icon);
              return (
                <button
                  key={game.id}
                  onClick={() => onSelect(game)}
                  className="card-glass rounded-xl p-6 group animate-fade-in-scale text-left
                  hover:border-primary/50 hover:shadow-glow-primary transition-all duration-300"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Capa: área maior + contain para não cortar arte */}
                  <div className="w-full h-44 rounded-lg mb-4 overflow-hidden bg-muted/40 flex items-center justify-center px-2 py-2">
                    {coverSrc ? (
                      <img
                        src={coverSrc}
                        alt={game.name}
                        className="max-h-full max-w-full w-auto h-auto object-contain"
                      />
                    ) : (
                      <Gamepad2 className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Ícone + nome; descrição só no hover */}
                  {game.description ? (
                    <HoverCard openDelay={200} closeDelay={100}>
                      <HoverCardTrigger asChild>
                        <div className="w-full text-left cursor-help pointer-events-auto">
                          <div className="flex items-center gap-3">
                            {iconSrc ? (
                              <img
                                src={iconSrc}
                                alt=""
                                className="w-8 h-8 shrink-0 rounded object-contain bg-muted/30"
                              />
                            ) : null}
                            <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                              {game.name}
                            </h3>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent
                        side="top"
                        align="start"
                        className="w-80 z-[100]"
                      >
                        <GameHoverCardContent
                          title={game.name}
                          description={game.description}
                          cover={game.image}
                          logo={game.icon}
                        />
                      </HoverCardContent>
                    </HoverCard>
                  ) : (
                    <div className="w-full text-left">
                      <div className="flex items-center gap-3">
                        {iconSrc ? (
                          <img
                            src={iconSrc}
                            alt=""
                            className="w-8 h-8 shrink-0 rounded object-contain bg-muted/30"
                          />
                        ) : null}
                        <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                          {game.name}
                        </h3>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Gamepad2, Loader2 } from "lucide-react";
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
    <div className="min-h-screen w-screen flex items-center justify-center p-6">
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
            {games.map((game, index) => (
              <button
                key={game.id}
                onClick={() => onSelect(game)}
                className="card-glass rounded-xl p-6 group animate-fade-in-scale text-left
                  hover:border-primary/50 hover:shadow-glow-primary transition-all duration-300"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Game Image */}
                <div className="w-full h-36 rounded-lg mb-4 overflow-hidden bg-muted/30 flex items-center justify-center">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Gamepad2 className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>

                {/* Game info */}
                <div className="flex items-center space-x-3 mb-2">
                  {game.icon && (
                    <img src={game.icon} alt="" className="w-8 h-8 rounded object-cover" />
                  )}
                  <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {game.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {game.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

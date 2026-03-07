"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileGameStatsSection } from "../ProfileGameStatsSection";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { games } from "../constants";

interface GameStatsTabProps {
  profile: getProfileByUsernameProps | null;
  selectedGame: string;
  setSelectedGame: (game: string) => void;
}

export function GameStatsTab({
  profile,
  selectedGame,
  setSelectedGame,
}: GameStatsTabProps) {
  return (
    <div className="space-y-6">
      {!selectedGame ? (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Escolha um jogo para ver as estatísticas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {games.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer hover:shadow-card transition-all duration-200 group"
                onClick={() => setSelectedGame(game.id)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-16 h-16 mx-auto rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <h3 className="font-semibold text-lg">{game.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedGame("")}
              className="hover:shadow-card transition-shadow duration-200"
            >
              ← Voltar
            </Button>
            <h2 className="text-xl font-bold text-card-foreground">
              Estatísticas -{" "}
              {selectedGame === "valorant"
                ? "Valorant"
                : selectedGame === "lol"
                  ? "League of Legends"
                  : "CS:GO"}
            </h2>
          </div>

          <ProfileGameStatsSection
            selectedGame={
              selectedGame === "valorant"
                ? "valorant"
                : selectedGame === "lol"
                  ? "lol"
                  : "csgo"
            }
            profile={profile}
          />
        </div>
      )}
    </div>
  );
}

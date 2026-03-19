"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileGameStatsSection } from "../ProfileGameStatsSection";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { GameDetails } from "@/services/getGames";
import { getGames } from "@/services/getGames";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { GameHoverCardContent } from "@/components/pages/profile/components/GameHoverCardContent";
import { getSteamStatus, type SteamStatusResponse } from "@/services/getSteamStatus";

function resolveMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return value;
  return getCloudinaryUrl(value);
}

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
  const [games, setGames] = useState<GameDetails[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [steamStatus, setSteamStatus] = useState<SteamStatusResponse | null>(null);
  const [steamStatusLoading, setSteamStatusLoading] = useState(false);

  const toKnownSlug = (game: GameDetails): "valorant" | "lol" | "csgo" | null => {
    const acronym = (game.acronym ?? "").toLowerCase();
    const name = (game.name ?? "").toLowerCase();

    if (acronym === "valorant" || name.includes("valorant")) return "valorant";
    if (acronym === "lol" || name.includes("league") || name.includes("lol")) return "lol";
    if (acronym === "csgo" || acronym === "cs2" || name.includes("counter") || name.includes("cs"))
      return "csgo";
    return null;
  };

  useEffect(() => {
    setLoadingGames(true);
    getGames()
      .then((data) => {
        setGames(data);
      })
      .catch(() => setGames([]))
      .finally(() => setLoadingGames(false));
  }, []);

  useEffect(() => {
    // Só precisamos da Steam status quando o usuário vai ver estatísticas do CS.
    if (!profile?.id) return;
    if (selectedGame !== "csgo") return;

    setSteamStatusLoading(true);
    getSteamStatus(profile.id)
      .then((data) => setSteamStatus(data))
      .catch(() => setSteamStatus(null))
      .finally(() => setSteamStatusLoading(false));
  }, [profile?.id, selectedGame]);

  const selectableGames = games
    .map((g) => ({ game: g, slug: toKnownSlug(g) }))
    .filter((x): x is { game: GameDetails; slug: "valorant" | "lol" | "csgo" } => !!x.slug);

  return (
    <div className="space-y-6">
      {!selectedGame ? (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Escolha um jogo para ver as estatísticas
          </h2>
          {loadingGames ? (
            <LoadingComponent
              text="Carregando jogos..."
              showText
              className="min-h-[180px]"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {selectableGames.map(({ game, slug }) => (
              <Card
                key={game.id}
                className="cursor-pointer hover:shadow-card transition-all duration-200 group"
                onClick={() => setSelectedGame(slug)}
              >
                <CardContent className="p-6 text-center space-y-4">
                  <img
                    src={resolveMediaUrl(game.image ?? game.icon)}
                    alt={game.name}
                    className="w-16 h-16 mx-auto rounded-lg group-hover:scale-105 transition-transform duration-200"
                  />
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <h3 className="font-semibold text-lg cursor-help">{game.name}</h3>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <GameHoverCardContent
                        title={game.name}
                        description={game.description}
                        cover={game.image}
                        logo={game.icon}
                      />
                      {game.acronym ? (
                        <div className="mt-3 text-xs text-muted-foreground text-center w-full">
                          {game.acronym}
                        </div>
                      ) : null}
                    </HoverCardContent>
                  </HoverCard>

                  {game.company?.name ? (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="text-sm text-muted-foreground cursor-help hover:underline">
                          {game.company.name}
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent>
                      <GameHoverCardContent
                        title={game.company.name}
                        description={game.company.description}
                        cover={game.company.banner}
                        logo={game.company.logo}
                      />
                      </HoverCardContent>
                    </HoverCard>
                  ) : null}
                </CardContent>
              </Card>
              ))}
            </div>
          )}
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

          {selectedGame === "csgo" && steamStatusLoading ? (
            <LoadingComponent
              text="Carregando status da Steam..."
              showText
              className="min-h-[140px]"
            />
          ) : selectedGame === "csgo" && steamStatus ? (
            steamStatus.steam_profile_public === false ? (
              <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
                Perfil da Steam privado. Não é possível exibir estatísticas.
              </div>
            ) : (
              <ProfileGameStatsSection
                selectedGame="csgo"
                profile={profile}
              />
            )
          ) : (
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
          )}
        </div>
      )}
    </div>
  );
}

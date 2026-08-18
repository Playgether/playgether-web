"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { GameDetails } from "@/services/getGames";
import { getGames } from "@/services/getGames";
import { getSteamStatus, SteamStatusResponse } from "@/services/getSteamStatus";
import { disconnectSteam } from "@/services/disconnectSteam";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { GameHoverCardContent } from "@/components/pages/profile/components/GameHoverCardContent";
import { GameMediaImage } from "@/components/media/GameMediaImage";
import { CheckCircle2, XCircle } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

let gamesCache: GameDetails[] | null = null;
let gamesPromise: Promise<GameDetails[]> | null = null;

const steamStatusCacheByProfileId = new Map<
  number,
  SteamStatusResponse | null
>();
const steamStatusPromiseByProfileId = new Map<
  number,
  Promise<SteamStatusResponse | null>
>();

function isSteamGame(game: GameDetails): boolean {
  const platformSlug = (game.platform_slug ?? "").toLowerCase();
  const acronym = (game.acronym ?? "").toLowerCase();

  if (platformSlug === "steam") return true;

  // Fallback para bancos antigos onde `platform` pode estar null.
  return acronym === "csgo" || acronym === "cs2";
}

export function GamesLibraryTab({
  profile,
  isOwner,
}: {
  profile: getProfileByUsernameProps | null;
  isOwner: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [steamStatus, setSteamStatus] = useState<SteamStatusResponse | null>(null);
  const [steamStatusLoading, setSteamStatusLoading] = useState(false);
  const [games, setGames] = useState<GameDetails[] | null>(null);
  const [gamesLoading, setGamesLoading] = useState(false);

  useEffect(() => {
    if (gamesCache) {
      setGames(gamesCache);
      return;
    }

    if (gamesPromise) {
      setGamesStateFromPromise(gamesPromise, setGames);
      return;
    }

    setGamesLoading(true);
    const p = getGames()
      .then((data) => {
        gamesCache = data;
        return data;
      })
      .finally(() => {
        gamesPromise = null;
        setGamesLoading(false);
      });
    gamesPromise = p;
    setGamesStateFromPromise(p, setGames);
  }, []);

  useEffect(() => {
    if (!profile?.id) {
      setSteamStatus(null);
      return;
    }

    const steamConnectedParam = searchParams?.get("steam_connected");
    if (steamConnectedParam === "1") {
      steamStatusCacheByProfileId.delete(profile.id);
      steamStatusPromiseByProfileId.delete(profile.id);
    }

    const profileId = profile.id;
    const cached = steamStatusCacheByProfileId.get(profileId);
    if (cached !== undefined) {
      setSteamStatus(cached);
      return;
    }

    const existingPromise = steamStatusPromiseByProfileId.get(profileId);
    if (existingPromise) {
      setSteamStateFromPromise(existingPromise, setSteamStatus);
      return;
    }

    setSteamStatusLoading(true);
    const p = getSteamStatus(profileId)
      .then((data) => {
        steamStatusCacheByProfileId.set(profileId, data);
        return data;
      })
      .catch(() => {
        steamStatusCacheByProfileId.set(profileId, null);
        return null;
      })
      .finally(() => {
        steamStatusPromiseByProfileId.delete(profileId);
        setSteamStatusLoading(false);
      });

    steamStatusPromiseByProfileId.set(profileId, p);
    setSteamStateFromPromise(p, setSteamStatus);
  }, [profile?.id, searchParams]);

  const handleConnectSteam = async () => {
    const currentSearch = searchParams?.toString() ?? "";
    const next = `${pathname}${currentSearch ? `?${currentSearch}` : ""}`;
    const res = await fetch("/api/auth/steam/start", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ next }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      redirect_url?: string;
      detail?: string;
    };
    if (!res.ok || !data.redirect_url) {
      console.error(data.detail ?? "Falha ao iniciar login Steam");
      return;
    }
    window.location.href = data.redirect_url;
  };

  const handleDisconnectSteam = async () => {
    try {
      setSteamStatusLoading(true);
      await disconnectSteam();
      // Mantemos os campos para não quebrar a UI.
      setSteamStatus({
        connected: false,
        nickname: null,
        avatar: null,
        steam_profile_public: false,
      });
      if (profile?.id) {
        steamStatusCacheByProfileId.set(profile.id, {
          connected: false,
          nickname: null,
          avatar: null,
          steam_profile_public: false,
        });
      }
    } finally {
      setSteamStatusLoading(false);
    }
  };

  const gamesToRender = games ?? [];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-6">Biblioteca de Jogos</h3>

      {gamesLoading && gamesToRender.length === 0 ? (
        <LoadingComponent
          text="Carregando jogos..."
          showText
          className="min-h-[140px]"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamesToRender.map((game) => {
            const steamGame = isSteamGame(game);
            const steamConnected = steamStatus?.connected ?? false;
            const steamAvatarSrc = steamConnected ? steamStatus?.avatar ?? null : null;

            const fallbackIconSrc = game.icon ?? game.image ?? null;
            const gameIconSrc = steamGame
              ? steamAvatarSrc ?? fallbackIconSrc
              : fallbackIconSrc;

            return (
              <Card
                key={game.id}
                className="hover:shadow-card transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {gameIconSrc ? (
                      <GameMediaImage
                        src={gameIconSrc}
                        alt={game.name}
                        size="icon"
                        objectFit="cover"
                        className="h-12 w-12 rounded"
                        spinnerClassName="h-4 w-4"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-card/50" />
                    )}

                    <div className="flex-1 space-y-2">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <h4 className="font-semibold cursor-help">
                            {game.name}
                          </h4>
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

                      {steamGame ? (
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>
                            {steamStatusLoading
                              ? "Carregando..."
                              : steamConnected
                                ? (
                                    <span className="inline-flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                                      Conectado
                                    </span>
                                  )
                                : (
                                    <span className="inline-flex items-center gap-2">
                                      <XCircle className="w-4 h-4 text-destructive" />
                                      Não conectado
                                    </span>
                                  )}
                          </div>

                          {steamConnected ? (
                            <>
                              {steamStatus?.steam_profile_public === false ? (
                                <div className="text-xs">Perfil Privado</div>
                              ) : (
                                <div>Nick: {steamStatus?.nickname ?? "-"}</div>
                              )}
                            </>
                          ) : null}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Em breve</div>
                      )}
                    </div>
                  </div>

                  {steamGame && isOwner ? (
                    steamStatusLoading ? (
                      <div className="w-full text-center text-sm text-muted-foreground">
                        Carregando...
                      </div>
                    ) : steamConnected ? (
                      <Button
                        variant="outline"
                        className="w-full hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all duration-200"
                        onClick={handleDisconnectSteam}
                      >
                        Desassociar Steam
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full hover:bg-gradient-primary hover:text-white hover:border-transparent transition-all duration-200"
                        onClick={handleConnectSteam}
                      >
                        Conectar conta
                      </Button>
                    )
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function setGamesStateFromPromise(
  promise: Promise<GameDetails[]>,
  setGames: (value: GameDetails[] | null) => void
) {
  promise.then(setGames).catch(() => setGames(null));
}

function setSteamStateFromPromise(
  promise: Promise<SteamStatusResponse | null>,
  setSteam: (value: SteamStatusResponse | null) => void
) {
  promise.then((data) => setSteam(data)).catch(() => setSteam(null));
}

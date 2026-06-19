"use client";

import { useCallback, useEffect, useState } from "react";
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
import { getStatsGames, type StatsGame } from "@/services/getStatsGames";
import { getCs2Stats, type Cs2StatsResponse } from "@/services/getCs2Stats";
import {
  getSteamStatus,
  type SteamStatusResponse,
} from "@/services/getSteamStatus";
import {
  getLolStats,
  type LolQueueScope,
  type LolStatsResponse,
  type LolTimeScope,
} from "@/services/getLolStats";

function resolveMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return value;
  return getCloudinaryUrl(value);
}

const cs2StatsCacheByProfileId = new Map<number, Cs2StatsResponse | null>();
const cs2StatsPromiseByProfileId = new Map<
  number,
  Promise<Cs2StatsResponse | null>
>();
const LOL_STATS_STALE_MS = 30 * 60 * 1000;

type LolStatsCacheEntry = { data: LolStatsResponse | null; fetchedAt: number };
const lolStatsCache = new Map<string, LolStatsCacheEntry>();
const lolStatsPromises = new Map<string, Promise<LolStatsResponse | null>>();

const statsGamesCacheByProfileId = new Map<number, StatsGame[]>();
const statsGamesPromiseByProfileId = new Map<number, Promise<StatsGame[]>>();
const steamStatusCacheByProfileId = new Map<number, SteamStatusResponse | null>();
const steamStatusPromiseByProfileId = new Map<
  number,
  Promise<SteamStatusResponse | null>
>();

interface GameStatsTabProps {
  profile: getProfileByUsernameProps | null;
  selectedGame: string;
  setSelectedGame: (game: string) => void;
  isOwner?: boolean;
}

export function GameStatsTab({
  profile,
  selectedGame,
  setSelectedGame,
  isOwner = false,
}: GameStatsTabProps) {
  const [games, setGames] = useState<GameDetails[]>([]);
  const [statsGames, setStatsGames] = useState<StatsGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [loadingStatsGames, setLoadingStatsGames] = useState(false);
  const [cs2Stats, setCs2Stats] = useState<Cs2StatsResponse | null>(null);
  const [cs2StatsLoading, setCs2StatsLoading] = useState(false);
  const [steamStatus, setSteamStatus] = useState<SteamStatusResponse | null>(null);
  const [steamStatusLoading, setSteamStatusLoading] = useState(false);
  const [lolStats, setLolStats] = useState<LolStatsResponse | null>(null);
  const [lolStatsLoading, setLolStatsLoading] = useState(false);
  const [lolTimeScope, setLolTimeScope] = useState<LolTimeScope>("platform");
  const [lolQueueScope, setLolQueueScope] = useState<LolQueueScope>("ranked_solo");
  const [lolSeasonId, setLolSeasonId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedGame === "lol" && lolQueueScope === "competitive") {
      setLolQueueScope("ranked_solo");
    }
  }, [lolQueueScope, selectedGame]);

  const toKnownSlug = (game: GameDetails): "valorant" | "lol" | "csgo" | null => {
    const acronym = (game.acronym ?? "").toLowerCase();
    const name = (game.name ?? "").toLowerCase();

    if (acronym === "valorant" || name.includes("valorant")) return "valorant";
    if (acronym === "lol" || name.includes("league") || name.includes("lol")) return "lol";
    if (acronym === "csgo" || acronym === "cs2" || name.includes("counter") || name.includes("cs"))
      return "csgo";
    return null;
  };

  const availableSlugs = new Set(statsGames.map((g) => g.slug));

  useEffect(() => {
    setLoadingGames(true);
    getGames()
      .then((data) => setGames(data))
      .catch(() => setGames([]))
      .finally(() => setLoadingGames(false));
  }, []);

  useEffect(() => {
    if (!profile?.id) {
      setStatsGames([]);
      return;
    }
    const profileId = profile.id;
    const cached = statsGamesCacheByProfileId.get(profileId);
    if (cached !== undefined) {
      setStatsGames(cached);
      return;
    }
    const existingPromise = statsGamesPromiseByProfileId.get(profileId);
    if (existingPromise) {
      existingPromise.then(setStatsGames).catch(() => setStatsGames([]));
      return;
    }
    setLoadingStatsGames(true);
    const p = getStatsGames(profileId)
      .then((data) => {
        statsGamesCacheByProfileId.set(profileId, data.games);
        return data.games;
      })
      .catch(() => {
        statsGamesCacheByProfileId.set(profileId, []);
        return [] as StatsGame[];
      })
      .finally(() => {
        statsGamesPromiseByProfileId.delete(profileId);
        setLoadingStatsGames(false);
      });
    statsGamesPromiseByProfileId.set(profileId, p);
    p.then(setStatsGames).catch(() => setStatsGames([]));
  }, [profile?.id]);

  const handleCs2ForceRefresh = useCallback(async () => {
    if (!profile?.id) return;
    const remaining = Number(cs2Stats?.force_refresh?.remaining_seconds ?? 0);
    if (remaining > 0) return;
    const profileId = profile.id;
    cs2StatsCacheByProfileId.delete(profileId);
    cs2StatsPromiseByProfileId.delete(profileId);
    setCs2StatsLoading(true);
    try {
      const data = await getCs2Stats(profileId, { force: true });
      cs2StatsCacheByProfileId.set(profileId, data);
      setCs2Stats(data);
    } catch {
      cs2StatsCacheByProfileId.set(profileId, null);
      setCs2Stats(null);
    } finally {
      cs2StatsPromiseByProfileId.delete(profileId);
      setCs2StatsLoading(false);
    }
  }, [profile?.id, cs2Stats?.force_refresh?.remaining_seconds]);

  useEffect(() => {
    if (!profile?.id || selectedGame !== "csgo") {
      setCs2Stats(null);
      return;
    }
    const profileId = profile.id;
    const ownerOnceKey =
      typeof window !== "undefined"
        ? `cs2_owner_refresh_once_${profileId}`
        : "";
    const shouldOwnerForceRefresh = !!(
      isOwner &&
      typeof window !== "undefined" &&
      ownerOnceKey &&
      sessionStorage.getItem(ownerOnceKey) !== "1"
    );

    if (shouldOwnerForceRefresh) {
      sessionStorage.setItem(ownerOnceKey, "1");
      cs2StatsCacheByProfileId.delete(profileId);
      cs2StatsPromiseByProfileId.delete(profileId);
    }

    const cached = cs2StatsCacheByProfileId.get(profileId);
    if (cached !== undefined && !shouldOwnerForceRefresh) {
      setCs2Stats(cached);
      return;
    }
    const existingPromise = cs2StatsPromiseByProfileId.get(profileId);
    if (existingPromise) {
      existingPromise.then(setCs2Stats).catch(() => setCs2Stats(null));
      return;
    }
    setCs2StatsLoading(true);
    const p = getCs2Stats(profileId, {
      force: shouldOwnerForceRefresh,
    })
      .then((data) => {
        cs2StatsCacheByProfileId.set(profileId, data);
        return data;
      })
      .catch(() => {
        cs2StatsCacheByProfileId.set(profileId, null);
        return null;
      })
      .finally(() => {
        cs2StatsPromiseByProfileId.delete(profileId);
        setCs2StatsLoading(false);
      });
    cs2StatsPromiseByProfileId.set(profileId, p);
    p.then(setCs2Stats).catch(() => setCs2Stats(null));
  }, [profile?.id, selectedGame, isOwner]);

  useEffect(() => {
    if (!profile?.id || selectedGame !== "csgo") {
      setSteamStatus(null);
      return;
    }
    const profileId = profile.id;
    const cached = steamStatusCacheByProfileId.get(profileId);
    if (cached !== undefined) {
      setSteamStatusLoading(false);
      setSteamStatus(cached);
      return;
    }
    const existingPromise = steamStatusPromiseByProfileId.get(profileId);
    if (existingPromise) {
      setSteamStatusLoading(true);
      existingPromise
        .then(setSteamStatus)
        .catch(() => setSteamStatus(null))
        .finally(() => setSteamStatusLoading(false));
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
    p.then(setSteamStatus).catch(() => setSteamStatus(null));
  }, [profile?.id, selectedGame]);

  useEffect(() => {
    if (!profile?.id || selectedGame !== "lol") {
      setLolStats(null);
      return;
    }

    const profileId = profile.id;
    const cacheKey = `${profileId}:${lolTimeScope}:${lolQueueScope}:${lolSeasonId ?? ""}`;
    const cached = lolStatsCache.get(cacheKey);
    if (cached !== undefined) {
      setLolStats(cached.data);
      const fresh = Date.now() - cached.fetchedAt < LOL_STATS_STALE_MS;
      if (fresh) {
        return;
      }
    }

    const existingPromise = lolStatsPromises.get(cacheKey);
    if (existingPromise) {
      existingPromise.then(setLolStats).catch(() => setLolStats(null));
      return;
    }

    const showLoading = cached === undefined;
    if (showLoading) {
      setLolStatsLoading(true);
    }
    const promise = getLolStats(profileId, {
      timeScope: lolTimeScope,
      queueScope: lolQueueScope,
      seasonId: lolSeasonId,
    })
      .then((data) => {
        lolStatsCache.set(cacheKey, { data, fetchedAt: Date.now() });
        return data;
      })
      .catch(() => {
        lolStatsCache.set(cacheKey, { data: null, fetchedAt: Date.now() });
        return null;
      })
      .finally(() => {
        lolStatsPromises.delete(cacheKey);
        if (showLoading) {
          setLolStatsLoading(false);
        }
      });

    lolStatsPromises.set(cacheKey, promise);
    promise.then(setLolStats).catch(() => setLolStats(null));
  }, [profile?.id, selectedGame, lolQueueScope, lolSeasonId, lolTimeScope]);

  useEffect(() => {
    if (selectedGame !== "lol") {
      return;
    }
    if (lolTimeScope !== "season") {
      return;
    }
    if (lolSeasonId) {
      return;
    }
    const firstSeason = lolStats?.seasonOptions?.[0]?.key ?? null;
    if (firstSeason) {
      setLolSeasonId(firstSeason);
    }
  }, [lolSeasonId, lolStats?.seasonOptions, lolTimeScope, selectedGame]);

  const selectableGames = games
    .map((g) => ({ game: g, slug: toKnownSlug(g) }))
    .filter((x): x is { game: GameDetails; slug: "lol" | "csgo" } => {
      if (!x.slug) return false;
      return (availableSlugs as Set<string>).has(x.slug);
    });
  const cs2SteamPending =
    selectedGame === "csgo" &&
    Boolean(profile?.id) &&
    steamStatus === null &&
    steamStatusCacheByProfileId.get(profile?.id ?? -1) === undefined;

  return (
    <div className="space-y-6">
      {!selectedGame ? (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Escolha um jogo para ver as estatísticas
          </h2>
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Apenas jogos em que você está conectado aparecem aqui"
              : "Apenas jogos em que este usuário está conectado aparecem aqui"}
          </p>
          {loadingGames || loadingStatsGames ? (
            <LoadingComponent
              text="Carregando jogos..."
              showText
              className="min-h-[180px]"
            />
          ) : selectableGames.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/50 p-6 text-muted-foreground">
              {isOwner
                ? "Nenhum jogo conectado. Conecte sua conta na aba Biblioteca para ver estatísticas."
                : "Este usuário ainda não se conectou a nenhum jogo"}
            </div>
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
                    src={resolveMediaUrl(game.icon ?? game.image)}
                    alt={game.name}
                    className="w-16 h-16 mx-auto rounded-lg object-cover group-hover:scale-105 transition-transform duration-200"
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
                  : "CS2"}
            </h2>
          </div>

          {selectedGame === "csgo" && (cs2StatsLoading || steamStatusLoading || cs2SteamPending) ? (
            <LoadingComponent
              text="Carregando Steam e estatísticas..."
              showText
              className="min-h-[140px]"
            />
          ) : selectedGame === "lol" && lolStatsLoading ? (
            <LoadingComponent
              text="Carregando estatísticas..."
              showText
              className="min-h-[140px]"
            />
          ) : selectedGame === "lol" && lolStats ? (
            lolStats.available === false ? (
              <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
                Não foi possível carregar estatísticas do League of Legends no momento.
              </div>
            ) : (
              <ProfileGameStatsSection
                selectedGame="lol"
                profile={profile}
                isOwner={isOwner}
                onCs2ForceRefresh={handleCs2ForceRefresh}
                cs2ForceRefreshLoading={cs2StatsLoading}
                lolStats={lolStats}
                lolTimeScope={lolTimeScope}
                lolQueueScope={lolQueueScope}
                lolSeasonId={lolSeasonId}
                onLolTimeScopeChange={setLolTimeScope}
                onLolQueueScopeChange={setLolQueueScope}
                onLolSeasonIdChange={setLolSeasonId}
              />
            )
          ) : selectedGame === "csgo" && cs2Stats ? (
            cs2Stats.available === false && cs2Stats.steam_profile_public === false ? (
              <div className="rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground">
                Perfil da Steam privado. Não é possível exibir estatísticas.
              </div>
            ) : (
              <ProfileGameStatsSection
                selectedGame="csgo"
                profile={profile}
                cs2Stats={cs2Stats}
                steamStatus={steamStatus}
                isOwner={isOwner}
                onCs2ForceRefresh={handleCs2ForceRefresh}
                cs2ForceRefreshLoading={cs2StatsLoading}
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
              isOwner={isOwner}
              steamStatus={steamStatus}
              onCs2ForceRefresh={handleCs2ForceRefresh}
              cs2ForceRefreshLoading={cs2StatsLoading}
              lolTimeScope={lolTimeScope}
              lolQueueScope={lolQueueScope}
              lolSeasonId={lolSeasonId}
              onLolTimeScopeChange={setLolTimeScope}
              onLolQueueScopeChange={setLolQueueScope}
              onLolSeasonIdChange={setLolSeasonId}
            />
          )}
        </div>
      )}
    </div>
  );
}

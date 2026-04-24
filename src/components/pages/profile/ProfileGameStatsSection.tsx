"use client";

import { useEffect, useRef, useState } from "react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Crosshair,
  Loader2,
  Map,
  Swords,
  Target,
  Trophy,
  TrendingUp,
} from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { Cs2StatsResponse } from "@/services/getCs2Stats";
import type {
  LolMatchDetail,
  LolMatchItem,
  LolQueueScope,
  LolStatsResponse,
  LolTimeScope,
} from "@/services/getLolStats";
import { getLolHistory } from "@/services/getLolStats";
import { LolMatchHistoryDetail } from "@/components/pages/profile/LolMatchHistoryDetail";
import { Info } from "lucide-react";

// ---- Types ----

type GameId = "valorant" | "lol" | "csgo";
type GameType = "fps" | "moba";

interface Season {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

interface FpsStats {
  kd: number;
  kda: string; // "1.28:1"
  winRate: number;
  headshotPct: number;
  bodyShotPct: number;
  legShotPct: number;
  currentElo: string;
  previousSeasonElo: string;
  peakElo: string;
  totalHours: number;
  seasonHours: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  seasonKills: number;
  seasonDeaths: number;
  seasonAssists: number;
  weapons: { name: string; kills: number; pct: number }[];
  mapWinRates: { map: string; winPct: number; wins: number; losses: number }[];
}

interface LolStats {
  kda: string;
  winRate: number;
  currentRank: string;
  lp: number;
  previousSeasonRank: string;
  peakRank: string;
  totalHours: number;
  seasonHours: number;
  totalKills: number;
  totalDeaths: number;
  totalAssists: number;
  seasonKills: number;
  seasonDeaths: number;
  seasonAssists: number;
  champions: { name: string; games: number; winPct: number; kda: string }[];
  roles: { role: string; games: number; winPct: number }[];
}

interface Match {
  id: string;
  map: string;
  result: "win" | "loss";
  score: string;
  kda: string;
  date: string;
  duration: string;
  lolMatchDetail?: LolMatchDetail | null;
  lolStaticAssets?: LolStatsResponse["staticAssets"];
  /** From API: Riot early surrender / remake flag. */
  lolIsRemake?: boolean;
  expandedDetails?: {
    kills: number;
    deaths: number;
    assists: number;
    headshotPct?: number;
    adr?: number;
    acs?: number;
    firstBloods?: number;
    mvps?: number;
    damage?: number;
    damageTaken?: number;
    cs?: number;
    csPerMinute?: number;
    vision?: number;
    gold?: number;
    kdaRatio?: number;
  };
  lolPreview?: {
    championName?: string | null;
    championImageUrl?: string | null;
    queueLabel?: string | null;
    roleLabel?: string | null;
    kdaRatio?: number | null;
    csPerMinute?: number | null;
    summonerSpell1Url?: string | null;
    summonerSpell2Url?: string | null;
    primaryRuneUrl?: string | null;
    secondaryRuneUrl?: string | null;
    buildItems?: Array<{
      itemId: number;
      iconUrl: string;
      name?: string;
    }>;
    blueParticipants?: Array<{
      gameName: string;
      championImageUrl?: string | null;
    }>;
    redParticipants?: Array<{
      gameName: string;
      championImageUrl?: string | null;
    }>;
  };
}

// ---- Mock Data ----

const seasons: Season[] = [
  {
    id: "s1",
    label: "EP08 - ACT3",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
  },
  {
    id: "s2",
    label: "EP08 - ACT2",
    startDate: "2024-11-20",
    endDate: "2025-01-14",
  },
  {
    id: "s3",
    label: "EP08 - ACT1",
    startDate: "2024-10-01",
    endDate: "2024-11-19",
  },
  {
    id: "s4",
    label: "EP07 - ACT3",
    startDate: "2024-08-15",
    endDate: "2024-09-30",
  },
];

const fpsStatsS1: FpsStats = {
  kd: 1.28,
  kda: "1.28:1",
  winRate: 63,
  headshotPct: 64,
  bodyShotPct: 28,
  legShotPct: 8,
  currentElo: "11,173",
  previousSeasonElo: "10,892",
  peakElo: "12,450",
  totalHours: 1247,
  seasonHours: 42,
  totalKills: 488,
  totalDeaths: 391,
  totalAssists: 96,
  seasonKills: 312,
  seasonDeaths: 248,
  seasonAssists: 58,
  weapons: [
    { name: "AK-47", kills: 176, pct: 36 },
    { name: "M4A4", kills: 105, pct: 21 },
    { name: "AWP", kills: 82, pct: 17 },
    { name: "Desert Eagle", kills: 45, pct: 9 },
  ],
  mapWinRates: [
    { map: "Mirage", winPct: 91, wins: 10, losses: 1 },
    { map: "Dust2", winPct: 67, wins: 8, losses: 4 },
    { map: "Inferno", winPct: 50, wins: 5, losses: 5 },
    { map: "Overpass", winPct: 33, wins: 2, losses: 4 },
  ],
};

const fpsStatsS2: FpsStats = {
  kd: 1.15,
  kda: "1.15:1",
  winRate: 58,
  headshotPct: 61,
  bodyShotPct: 31,
  legShotPct: 8,
  currentElo: "10,892",
  previousSeasonElo: "10,200",
  peakElo: "11,500",
  totalHours: 1205,
  seasonHours: 38,
  totalKills: 420,
  totalDeaths: 365,
  totalAssists: 82,
  seasonKills: 265,
  seasonDeaths: 230,
  seasonAssists: 45,
  weapons: [
    { name: "AK-47", kills: 150, pct: 35 },
    { name: "M4A4", kills: 95, pct: 22 },
    { name: "AWP", kills: 70, pct: 16 },
  ],
  mapWinRates: [
    { map: "Mirage", winPct: 85, wins: 11, losses: 2 },
    { map: "Dust2", winPct: 60, wins: 6, losses: 4 },
  ],
};

const fpsStatsBySeason: Record<string, FpsStats> = {
  s1: fpsStatsS1,
  s2: fpsStatsS2,
  s3: {
    ...fpsStatsS1,
    currentElo: "10,200",
    previousSeasonElo: "9,800",
    peakElo: "10,500",
  },
  s4: {
    ...fpsStatsS1,
    currentElo: "9,800",
    previousSeasonElo: "9,200",
    peakElo: "10,100",
  },
};

const lolStatsS1: LolStats = {
  kda: "2.45:1",
  winRate: 58,
  currentRank: "Diamond 2",
  lp: 45,
  previousSeasonRank: "Platinum 1",
  peakRank: "Diamond 1",
  totalHours: 890,
  seasonHours: 65,
  totalKills: 3420,
  totalDeaths: 1850,
  totalAssists: 4120,
  seasonKills: 245,
  seasonDeaths: 132,
  seasonAssists: 298,
  champions: [
    { name: "Aphelios", games: 45, winPct: 62, kda: "2.8:1" },
    { name: "Ahri", games: 32, winPct: 66, kda: "2.4:1" },
    { name: "Jinx", games: 28, winPct: 54, kda: "2.1:1" },
    { name: "Viktor", games: 22, winPct: 50, kda: "2.6:1" },
  ],
  roles: [
    { role: "ADC", games: 68, winPct: 59 },
    { role: "Mid", games: 45, winPct: 56 },
    { role: "Top", games: 12, winPct: 50 },
  ],
};

const lolStatsBySeason: Record<string, LolStats> = {
  s1: lolStatsS1,
  s2: { ...lolStatsS1, currentRank: "Platinum 1", lp: 78 },
  s3: { ...lolStatsS1, currentRank: "Platinum 2", lp: 32 },
  s4: { ...lolStatsS1, currentRank: "Gold 1", lp: 95 },
};

const generateMatches = (
  gameId: GameId,
  count: number,
  offset = 0,
): Match[] => {
  const maps =
    gameId === "csgo"
      ? ["Mirage", "Dust2", "Inferno", "Overpass", "Nuke", "Ancient"]
      : gameId === "valorant"
        ? ["Ascent", "Bind", "Haven", "Split", "Icebox"]
        : ["Summoner's Rift"];
  const results: ("win" | "loss")[] = ["win", "loss"];
  const dates = [
    "2h atrás",
    "5h atrás",
    "1d atrás",
    "2d atrás",
    "3d atrás",
    "5d atrás",
    "1 sem atrás",
  ];

  return Array.from({ length: count }, (_, i) => {
    const idx = offset + i;
    const map = maps[idx % maps.length];
    const result = results[idx % 2];
    const score = result === "win" ? "13-9" : "11-13";
    const kills = 12 + (idx % 12);
    const deaths = 10 + (idx % 10);
    const assists = 4 + (idx % 6);
    return {
      id: `m-${gameId}-${offset + i}`,
      map,
      result,
      score,
      kda: `${kills}/${deaths}/${assists}`,
      date: dates[idx % dates.length],
      duration: `${25 + (idx % 15)}m`,
      expandedDetails: {
        kills,
        deaths,
        assists,
        headshotPct: gameId !== "lol" ? 55 + (idx % 25) : undefined,
        adr: gameId !== "lol" ? 75 + idx * 2 : undefined,
        acs: gameId === "valorant" ? 180 + idx * 3 : undefined,
        firstBloods: gameId !== "lol" ? idx % 3 : undefined,
        mvps: gameId !== "lol" ? idx % 2 : undefined,
        damage: gameId === "lol" ? 18000 + idx * 200 : undefined,
        cs: gameId === "lol" ? 150 + idx * 10 : undefined,
        vision: gameId === "lol" ? 25 + (idx % 15) : undefined,
        gold: gameId === "lol" ? 11000 + idx * 100 : undefined,
      },
    };
  });
};

// ---- Component ----

interface ProfileGameStatsSectionProps {
  selectedGame: GameId;
  profile: getProfileByUsernameProps | null;
  cs2Stats?: Cs2StatsResponse | null;
  lolStats?: LolStatsResponse | null;
  lolTimeScope?: LolTimeScope;
  lolQueueScope?: LolQueueScope;
  lolSeasonId?: string | null;
  onLolTimeScopeChange?: (value: LolTimeScope) => void;
  onLolQueueScopeChange?: (value: LolQueueScope) => void;
  onLolSeasonIdChange?: (value: string | null) => void;
}

export function ProfileGameStatsSection({
  selectedGame,
  profile,
  cs2Stats,
  lolStats: lolStatsResponse,
  lolTimeScope = "platform",
  lolQueueScope = "ranked_solo",
  lolSeasonId = null,
  onLolTimeScopeChange,
  onLolQueueScopeChange,
  onLolSeasonIdChange,
}: ProfileGameStatsSectionProps) {
  const [statsTab, setStatsTab] = useState("overview");
  const [season, setSeason] = useState("s1");
  const [competitiveOnly, setCompetitiveOnly] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchesLoaded, setMatchesLoaded] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lolHistoryItems, setLolHistoryItems] = useState<LolMatchItem[]>([]);
  const [lolHistoryCursor, setLolHistoryCursor] = useState<string | null>(null);
  const [lolHistoryHasMore, setLolHistoryHasMore] = useState(false);
  /** Evita resetar o histórico local quando o pai re-renderiza com novo objeto `historyPage` igual. */
  const lolHistoryHydrateTokenRef = useRef<string>("");

  const gameType: GameType = selectedGame === "lol" ? "moba" : "fps";
  const displayName =
    selectedGame === "valorant"
      ? "Valorant"
      : selectedGame === "lol"
        ? "League of Legends"
        : "CS2";
  const profileNick =
    selectedGame === "lol"
      ? (lolStatsResponse?.account?.riotId ?? profile?.name ?? "Player")
      : profile?.name || "Player";
  const useRealCs2Stats =
    selectedGame === "csgo" && cs2Stats?.available === true && Boolean(cs2Stats?.stats);
  const isCs2WithoutStats = selectedGame === "csgo" && !useRealCs2Stats;
  const useRealLolStats =
    selectedGame === "lol" &&
    lolStatsResponse?.available === true &&
    Boolean(lolStatsResponse?.overview);
  const fpsStats = fpsStatsBySeason[season] ?? fpsStatsBySeason["s1"];
  const lolMockStats = lolStatsBySeason[season] ?? lolStatsBySeason["s1"];

  const allMatches = generateMatches(selectedGame, matchesLoaded);
  const matchesToShow = competitiveOnly ? allMatches : allMatches; // No filtro real, só UI
  const lolMatchesToShow = (lolStatsResponse?.recentMatches ?? []).slice(0, matchesLoaded);
  const activeSeasonOptions = lolStatsResponse?.seasonOptions ?? [];
  const isLolBackfillRunning =
    selectedGame === "lol" && (lolStatsResponse?.syncStatus?.state ?? "") === "syncing_backfill";

  const lolHistoryFilterKey = `${profile?.id ?? ""}:${lolTimeScope}:${lolQueueScope}:${lolSeasonId ?? ""}`;
  const lolHistoryPage = lolStatsResponse?.historyPage;
  const lolHistorySeed =
    lolHistoryPage != null
      ? `${lolHistoryPage.items?.length ?? 0}:${lolHistoryPage.items?.[0]?.matchId ?? ""}:${String(
          lolHistoryPage.nextCursor ?? "",
        )}:${lolHistoryPage.hasMore ? 1 : 0}:${lolHistoryPage.limit ?? 0}`
      : "";

  useEffect(() => {
    if (selectedGame !== "lol") {
      lolHistoryHydrateTokenRef.current = "";
      return;
    }
    if (!lolHistoryPage || !lolHistorySeed) return;
    const token = `${lolHistoryFilterKey}|${lolHistorySeed}`;
    if (lolHistoryHydrateTokenRef.current === token) return;
    lolHistoryHydrateTokenRef.current = token;
    setLolHistoryItems(lolHistoryPage.items ?? []);
    setLolHistoryCursor(lolHistoryPage.nextCursor ?? null);
    const hasMore =
      Boolean(lolHistoryPage.nextCursor) || Boolean(lolHistoryPage.hasMore);
    setLolHistoryHasMore(hasMore);
    // `lolHistorySeed` já resume o conteúdo de `historyPage`; não depender do objeto inteiro evita reset por re-render.
  }, [selectedGame, lolHistoryFilterKey, lolHistorySeed]);

  const handleLoadMore = async () => {
    if (selectedGame === "lol") {
      if (!profile?.id || !lolHistoryHasMore || loadingMore) return;
      setLoadingMore(true);
      try {
        const response = await getLolHistory(profile.id, {
          timeScope: lolTimeScope,
          queueScope: lolQueueScope,
          seasonId: lolSeasonId,
          cursor: lolHistoryCursor,
          limit: 20,
        });
        const nextItems = response.historyPage?.items ?? [];
        setLolHistoryItems((prev) => [...prev, ...nextItems]);
        setLolHistoryCursor(response.historyPage?.nextCursor ?? null);
        setLolHistoryHasMore(
          Boolean(response.historyPage?.nextCursor) ||
            Boolean(response.historyPage?.hasMore),
        );
      } finally {
        setLoadingMore(false);
      }
      return;
    }
    setLoadingMore(true);
    setTimeout(() => {
      setMatchesLoaded((prev) => prev + 10);
      setLoadingMore(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Player header - plataforma; LoL real usa ícone + Riot ID da conta do jogo */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <div className="relative inline-block shrink-0">
            {useRealLolStats && selectedGame === "lol" && lolStatsResponse?.account?.profileIconUrl ? (
              <img
                src={lolStatsResponse.account.profileIconUrl}
                alt=""
                className="h-14 w-14 rounded-md border-2 border-border ring-2 ring-primary/20 object-cover"
              />
            ) : (
              <ProfileAvatar
                displayName={profileNick}
                username={profile?.username}
                profilePhoto={profile?.profile_photo ?? null}
                sizeClass="h-14 w-14"
                ringClass="border-2 border-border ring-2 ring-primary/20"
                fallbackTextClassName="text-base font-bold"
              />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-card-foreground truncate">
              {profileNick}
            </h3>
            <p className="text-sm text-muted-foreground">
              {useRealLolStats && selectedGame === "lol" && lolStatsResponse?.account ? (
                <>
                  Nível {lolStatsResponse.account.summonerLevel ?? 0} · Região{" "}
                  {(lolStatsResponse.account.platformRegion ?? "").toUpperCase()}
                </>
              ) : selectedGame === "csgo" ? (
                <>
                  Steam{" · "}
                  {displayName}
                </>
              ) : selectedGame === "valorant" ? (
                <>
                  Riot ID{" · "}
                  {displayName}
                </>
              ) : (
                <>
                  Summoner{" · "}
                  {displayName}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters row - hide for CS2 (no seasons in Steam API) */}
      {!useRealCs2Stats && !useRealLolStats && selectedGame !== "csgo" && (
        <div className="flex flex-wrap items-center gap-3">
          <Select value={season} onValueChange={setSeason}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <SelectValue placeholder="Temporada" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={competitiveOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setCompetitiveOnly(!competitiveOnly)}
            className={
              competitiveOnly
                ? "bg-gradient-primary text-white border-0"
                : "border-border"
            }
          >
            Competitivo
          </Button>
          {!competitiveOnly && (
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => setCompetitiveOnly(true)}
            >
              Todos
            </Button>
          )}
        </div>
      )}

      {useRealLolStats && selectedGame === "lol" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={lolTimeScope}
              onValueChange={(value) => {
                const nextValue = value as LolTimeScope;
                onLolTimeScopeChange?.(nextValue);
                if (nextValue === "platform") {
                  onLolSeasonIdChange?.(null);
                } else if (!lolSeasonId && activeSeasonOptions[0]) {
                  onLolSeasonIdChange?.(activeSeasonOptions[0].key);
                }
              }}
            >
              <SelectTrigger className="w-[210px] bg-card border-border cursor-pointer">
                <SelectValue placeholder="Escopo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Gerais (Playgether)</SelectItem>
                <SelectItem value="season">Temporada</SelectItem>
              </SelectContent>
            </Select>

            {lolTimeScope === "season" && (
              activeSeasonOptions.length > 0 ? (
                <Select
                  value={lolSeasonId ?? activeSeasonOptions[0]?.key}
                  onValueChange={(value) => onLolSeasonIdChange?.(value)}
                >
                  <SelectTrigger className="w-[180px] bg-card border-border cursor-pointer">
                    <SelectValue placeholder="Temporada" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeSeasonOptions.map((option) => (
                      <SelectItem key={option.key} value={option.key}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground rounded-lg border border-border bg-card/50 px-3 py-2">
                  Nenhuma season sincronizada ainda
                </div>
              )
            )}

            <Select
              value={lolQueueScope}
              onValueChange={(value) => onLolQueueScopeChange?.(value as LolQueueScope)}
            >
              <SelectTrigger className="w-[220px] bg-card border-border cursor-pointer">
                <SelectValue placeholder="Fila" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranked_solo">Ranked Solo/Duo</SelectItem>
                <SelectItem value="ranked_flex">Ranked Flex</SelectItem>
                <SelectItem value="aram">ARAM</SelectItem>
                <SelectItem value="all">Todas as filas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {((lolStatsResponse?.disclaimers ?? []).length > 0 || isLolBackfillRunning) ? (
            <div className="flex flex-col gap-2">
              {(lolStatsResponse?.disclaimers ?? []).map((disclaimer) => (
                <div
                  key={disclaimer}
                  className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2"
                >
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>{disclaimer}</span>
                </div>
              ))}
              {isLolBackfillRunning ? (
                <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Exibindo as partidas mais recentes. O restante da temporada ainda esta sincronizando em segundo plano.
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {useRealCs2Stats && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 w-fit">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Estatísticas atualizadas a cada 30 minutos</span>
        </div>
      )}

      {isCs2WithoutStats ? (
        <Cs2StatsUnavailable />
      ) : (
        <Tabs value={statsTab} onValueChange={setStatsTab} className="w-full">
          <TabsList
            className={`grid w-full bg-card border border-border ${useRealCs2Stats ? "grid-cols-1" : "grid-cols-2"}`}
          >
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            {(selectedGame === "lol" || (!useRealCs2Stats && selectedGame !== "csgo")) && (
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white"
              >
                Partidas
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {useRealCs2Stats ? (
              <Cs2Overview stats={cs2Stats.stats!} />
            ) : useRealLolStats ? (
              <RealLolOverview stats={lolStatsResponse!} />
            ) : gameType === "fps" ? (
              <FpsOverview stats={fpsStats} />
            ) : (
              <LolOverview stats={lolMockStats} />
            )}
          </TabsContent>

          <TabsContent value="matches" className="space-y-4 mt-6">
            <MatchHistory
              matches={
                useRealLolStats && selectedGame === "lol"
                  ? mapLolMatchesToUi(
                      lolHistoryItems.length > 0 ? lolHistoryItems : lolMatchesToShow,
                      lolStatsResponse?.staticAssets,
                    )
                  : matchesToShow
              }
              gameId={selectedGame}
              expandedMatch={expandedMatch}
              onToggleExpand={setExpandedMatch}
              onLoadMore={handleLoadMore}
              loadingMore={loadingMore}
              hasMore={selectedGame === "lol" ? lolHistoryHasMore : true}
              loadMoreDisabled={isLolBackfillRunning}
              loadMoreDisabledLabel="Aguardando sincronizacao do restante da temporada..."
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ---- CS2 Overview (real stats from Steam API) ----

type Cs2StatsData = NonNullable<Cs2StatsResponse["stats"]>;

function Cs2StatsUnavailable() {
  return (
    <Card className="bg-card/50 border-border">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Este usuário não possui estatísticas disponíveis no CS2 no momento.
        </p>
      </CardContent>
    </Card>
  );
}

function Cs2Overview({ stats }: { stats: Cs2StatsData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="K/D"
          value={stats.kdFormatted}
          accent="text-neon-green"
        />
        <StatCard
          icon={<Crosshair className="h-4 w-4" />}
          label="HS%"
          value={`${stats.headshotPct}%`}
          accent="text-neon-blue"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Win Rate"
          value={`${stats.winrate}%`}
          accent="text-neon-purple"
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Horas"
          value={`${stats.totalHours}h`}
          accent="text-neon-pink"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4" />
              K/D e Precisão
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kills</span>
                <span className="font-medium">
                  {stats.totalKills.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mortes</span>
                <span className="font-medium">
                  {stats.totalDeaths.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiros disparados</span>
                <span className="font-medium">
                  {stats.totalShotsFired.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tiros acertados</span>
                <span className="font-medium">
                  {stats.totalShotsHit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Precisão</span>
                <span className="font-medium">{stats.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Média de tiros por kill
                </span>
                <span className="font-medium">{stats.shotsPerKill}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Partidas e Rounds
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partidas</span>
                <span className="font-medium">
                  {stats.totalMatchesPlayed.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vitórias</span>
                <span className="font-medium text-neon-green">
                  {stats.totalMatchesWon.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rounds</span>
                <span className="font-medium">
                  {stats.totalRoundsPlayed.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">MVPs</span>
                <span className="font-medium">
                  {stats.totalMvps.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Headshots
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Headshots totais</span>
                <span className="font-medium">
                  {stats.totalHeadshots.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Percentual de headshot
                </span>
                <span className="font-medium">{stats.headshotPct}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Bombas e Utilidade
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plants</span>
                <span className="font-medium">
                  {stats.totalPlants.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Defuses</span>
                <span className="font-medium">
                  {stats.totalDefuses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kills faca</span>
                <span className="font-medium">{stats.totalKillsKnife}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kills granada</span>
                <span className="font-medium">{stats.totalKillsHegrenade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kills molotov</span>
                <span className="font-medium">{stats.totalKillsMolotov}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Tiros de taser (Zeus)
                </span>
                <span className="font-medium">{stats.totalShotsTaser}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              CT vs T
            </h4>
            <div className="space-y-2 text-sm">
              {(stats.ctWeaponKills ?? []).map((w) => (
                <div key={w.name} className="flex justify-between">
                  <span className="text-muted-foreground">
                    Kills com {w.name}
                  </span>
                  <span className="font-medium">
                    {w.kills.toLocaleString()} kills ({w.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {stats.sniperStats && (
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Snipers
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kills</span>
                  <span className="font-medium">
                    {stats.sniperStats.totalKills.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Percentual</span>
                  <span className="font-medium">{stats.sniperStats.pct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Kills vs sniper zoomado
                  </span>
                  <span className="font-medium">
                    {stats.sniperStats.killsVsZoomed?.toLocaleString() ?? 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {(stats.alternativeWeapons ?? []).length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Armas alternativas favoritas
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.alternativeWeapons.map((w) => (
                <Badge
                  key={w.name}
                  variant="secondary"
                  className="border border-border py-1.5 px-2 gap-1"
                >
                  <span className="font-medium">{w.name}</span>
                  <span className="text-muted-foreground">
                    {w.kills.toLocaleString()} kills ({w.pct}%)
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.mapWinRates.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Map className="h-4 w-4" />
              Vitórias por mapa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stats.mapWinRates.map((m) => (
                <div
                  key={m.map}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
                >
                  <span className="font-medium text-sm">{m.map}</span>
                  <span
                    className={`text-sm font-semibold ${
                      m.winPct >= 50 ? "text-neon-green" : "text-red-500"
                    }`}
                  >
                    {m.winPct}% ({m.wins}V/{m.losses}D)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---- FPS Overview ----

function FpsOverview({ stats }: { stats: FpsStats }) {
  return (
    <div className="space-y-6">
      {/* Core stats - bento grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="K/D"
          value={stats.kd.toFixed(2)}
          accent="text-neon-green"
        />
        <StatCard
          icon={<Crosshair className="h-4 w-4" />}
          label="HS%"
          value={`${stats.headshotPct}%`}
          accent="text-neon-blue"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Win Rate"
          value={`${stats.winRate}%`}
          accent="text-neon-purple"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Elo Atual"
          value={stats.currentElo}
          accent="text-neon-pink"
          subValue="Premier"
        />
      </div>

      {/* Elo evolution + Shot distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border overflow-hidden">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progresso de Elo
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Anterior</span>
                <span className="font-medium">{stats.previousSeasonElo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pico</span>
                <span className="font-medium text-neon-green">
                  {stats.peakElo}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border overflow-hidden">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Distribuição de Tiros
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs">Cabeça {stats.headshotPct}%</span>
                <Progress value={stats.headshotPct} className="flex-1 h-2" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs">Corpo {stats.bodyShotPct}%</span>
                <Progress value={stats.bodyShotPct} className="flex-1 h-2" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-xs">Pernas {stats.legShotPct}%</span>
                <Progress value={stats.legShotPct} className="flex-1 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KDA + Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4" />
              KDA Total / Season
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">
                  {stats.totalKills} / {stats.totalDeaths} /{" "}
                  {stats.totalAssists}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold">
                  {stats.seasonKills} / {stats.seasonDeaths} /{" "}
                  {stats.seasonAssists}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Jogadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-neon-blue">
                  {stats.totalHours}h
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold text-neon-purple">
                  {stats.seasonHours}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weapons */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Armas mais utilizadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.weapons.map((w) => (
              <Badge
                key={w.name}
                variant="secondary"
                className="border border-border py-1.5 px-2 gap-1"
              >
                <span className="font-medium">{w.name}</span>
                <span className="text-muted-foreground">{w.kills} kills</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map win rates */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Map className="h-4 w-4" />
            Vitórias por mapa
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {stats.mapWinRates.map((m) => (
              <div
                key={m.map}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="font-medium text-sm">{m.map}</span>
                <span
                  className={`text-sm font-semibold ${
                    m.winPct >= 50 ? "text-neon-green" : "text-red-500"
                  }`}
                >
                  {m.winPct}% ({m.wins}V/{m.losses}D)
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- LoL Overview ----

function LolOverview({ stats }: { stats: LolStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="KDA"
          value={stats.kda}
          accent="text-neon-green"
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Win Rate"
          value={`${stats.winRate}%`}
          accent="text-neon-purple"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Rank Atual"
          value={stats.currentRank}
          accent="text-neon-blue"
          subValue={`${stats.lp} LP`}
        />
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Pico"
          value={stats.peakRank}
          accent="text-neon-pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4" />
              KDA Total / Season
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">
                  {stats.totalKills} / {stats.totalDeaths} /{" "}
                  {stats.totalAssists}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold">
                  {stats.seasonKills} / {stats.seasonDeaths} /{" "}
                  {stats.seasonAssists}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas Jogadas
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold text-neon-blue">
                  {stats.totalHours}h
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Season</p>
                <p className="font-semibold text-neon-purple">
                  {stats.seasonHours}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Personagens mais jogados
          </h4>
          <div className="space-y-2">
            {stats.champions.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50"
              >
                <span className="font-medium text-sm">{c.name}</span>
                <span className="text-sm text-muted-foreground">
                  {c.games} jogos · {c.winPct}% WR · {c.kda} KDA
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-4">
          <h4 className="font-semibold text-sm text-muted-foreground mb-3">
            Roles mais jogadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {stats.roles.map((r) => (
              <Badge
                key={r.role}
                variant="secondary"
                className="border border-border py-1.5 px-2 gap-1"
              >
                <span className="font-medium">{r.role}</span>
                <span className="text-muted-foreground">
                  {r.games} jogos · {r.winPct}% WR
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type LolChampionRollupRow = NonNullable<LolStatsResponse["championsSeason"]>[number];

function lolWinRateAccentClass(winRate: number): string {
  if (Math.abs(winRate - 50) < 0.001) return "text-amber-400";
  if (winRate > 50) return "text-neon-green";
  return "text-red-500";
}

/** Acima de 1 = positivo (verde), abaixo = negativo (vermelho), ~1 = neutro (amarelo). */
function lolKdaRatioAccentClass(ratio: number): string {
  if (ratio > 1.001) return "text-neon-green";
  if (ratio < 0.999) return "text-red-500";
  return "text-amber-400";
}

function lolRankTierTextClass(tier: string | undefined | null): string {
  const t = (tier || "").trim().toUpperCase();
  if (!t) return "text-muted-foreground";
  const map: Record<string, string> = {
    IRON: "text-[#8d9199]",
    BRONZE: "text-[#cd7f32]",
    SILVER: "text-[#bcc6d6]",
    GOLD: "text-[#e4c88b]",
    PLATINUM: "text-[#5bc9c4]",
    EMERALD: "text-[#2ecf9f]",
    DIAMOND: "text-[#7ebfff]",
    MASTER: "text-[#b27dff]",
    GRANDMASTER: "text-[#f15d5d]",
    CHALLENGER: "text-[#f4c874]",
  };
  return map[t] ?? "text-muted-foreground";
}

/**
 * Emblemas de elo (CDragon) vêm com bastante área transparente; ampliamos e cortamos no quadro.
 */
function LolRankEmblemFrame({
  src,
  alt,
  frameClass,
  zoomPercent = 158,
}: {
  src: string;
  alt: string;
  /** Classes de tamanho do container, ex: h-28 w-28 */
  frameClass: string;
  /** Largura/altura da imagem em % do container (maior = mais “zoom”) */
  zoomPercent?: number;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-xl border border-border/70 bg-gradient-to-b from-muted/40 to-muted/15 shadow-inner ${frameClass}`}
    >
      <img
        src={src}
        alt={alt}
        className="absolute left-1/2 top-1/2 max-h-none max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center pointer-events-none"
        style={{ width: `${zoomPercent}%`, height: `${zoomPercent}%` }}
      />
    </div>
  );
}

function LolChampionOverviewRow({ champion }: { champion: LolChampionRollupRow }) {
  const wrClass = lolWinRateAccentClass(champion.winRate);
  const kdaClass = lolKdaRatioAccentClass(champion.kda);
  return (
    <div className="flex gap-3 rounded-lg border border-border/50 bg-muted/20 p-3 sm:p-3.5">
      {champion.championImageUrl ? (
        <img
          src={champion.championImageUrl}
          alt={champion.championName}
          className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border border-border/80 object-cover shrink-0 shadow-sm"
        />
      ) : (
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-muted border border-border shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
          {(champion.championName || "?").slice(0, 1)}
        </div>
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <p className="font-semibold text-base sm:text-lg leading-tight break-words">
          {champion.championName}
        </p>
        <div className="flex flex-col gap-2 text-sm sm:text-base">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">Jogos</span>
            <span className="font-semibold tabular-nums text-foreground">{champion.games}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">WR</span>
            <span className={`font-bold tabular-nums ${wrClass}`}>{champion.winRate}%</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-muted-foreground text-xs uppercase tracking-wide">KDA</span>
            <span className={`font-bold tabular-nums ${kdaClass}`}>{champion.kda}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Ícone de elo em coluna fixa + texto, para alinhar verticalmente entre filas. */
function LolRankedQueueBlock({
  queueTitle,
  queue,
}: {
  queueTitle: string;
  queue?: {
    label: string | null;
    iconUrl?: string | null;
    tier?: string;
  } | null;
}) {
  const text = queue?.label ?? "Sem dados";
  const tierClass = lolRankTierTextClass(queue?.tier ?? null);
  return (
    <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 items-center text-sm">
      <div className="flex h-full min-h-[52px] items-center justify-center self-start pt-0.5">
        {queue?.iconUrl ? (
          <LolRankEmblemFrame
            src={queue.iconUrl}
            alt={`Emblema ranqueado — ${queueTitle}`}
            frameClass="h-11 w-11"
            zoomPercent={154}
          />
        ) : (
          <div className="h-11 w-11 shrink-0 rounded-xl border border-border/60 bg-muted/35" />
        )}
      </div>
      <div className="min-w-0 space-y-0.5 py-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {queueTitle}
        </p>
        <p className={`text-sm sm:text-base font-semibold leading-snug break-words ${tierClass}`}>
          {text}
        </p>
      </div>
    </div>
  );
}

function RealLolOverview({ stats }: { stats: LolStatsResponse }) {
  const overview = stats.overview;
  const rankedCurrent = stats.ranked?.current;
  const selectedRanked = stats.ranked?.selectedQueueRanked ?? null;
  const bestQueue =
    selectedRanked ??
    stats.ranked?.queues?.RANKED_SOLO_5x5 ??
    stats.ranked?.queues?.RANKED_FLEX_SR ??
    null;
  const filterRank = stats.ranked?.selectedQueueRanked ?? bestQueue;
  const rankDisplayLabel = filterRank?.label ?? rankedCurrent?.label ?? "Sem rank";
  const rankLpText = filterRank
    ? `${filterRank.leaguePoints.toLocaleString()} LP`
    : rankedCurrent
      ? `${rankedCurrent.leaguePoints.toLocaleString()} LP`
      : "Sem dados ranqueados";
  const rankEmblemUrl = filterRank?.iconUrl ?? rankedCurrent?.iconUrl ?? null;
  const seasonChampions = stats.championsSeason ?? [];
  const overallChampions = stats.championsOverall ?? [];
  const last20 = stats.last20Summary;
  const completeness = stats.dataCompleteness;

  if (!overview) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Não há dados suficientes para exibir estatísticas do League of Legends ainda.
        </CardContent>
      </Card>
    );
  }

  const rankTierKey = (filterRank?.tier ?? rankedCurrent?.tier ?? "").trim();
  const rankTitleClass = lolRankTierTextClass(rankTierKey || null);
  const winRateAccent = lolWinRateAccentClass(overview.winRate);
  const kdaAccent = lolKdaRatioAccentClass(overview.kdaRatio);
  const queueScope = stats.appliedFilters?.queueScope ?? "ranked_solo";
  const showBothRankedQueues = queueScope === "all";
  const showRankedSoloRow = queueScope === "ranked_solo" || showBothRankedQueues;
  const showRankedFlexRow = queueScope === "ranked_flex" || showBothRankedQueues;
  const rankedLpSource = filterRank;
  /** WR do card superior = rollup das partidas sincronizadas (filtro). WR do snapshot Riot (liga) costuma divergir — usamos o mesmo do overview aqui. */
  const rankedWrDisplay = `${overview.winRate}%`;
  const rankedWrClass = lolWinRateAccentClass(overview.winRate);

  return (
    <div className="space-y-6">
      {completeness ? (
        <Card className="bg-card/40 border-border">
          <CardContent className="p-4 text-xs text-muted-foreground flex flex-wrap gap-4">
            <span>Total sincronizadas: {completeness.totalMatchesSynced}</span>
            <span>Temporada sincronizadas: {completeness.seasonMatchesSynced}</span>
            <span>
              Cobertura: {completeness.isPartial ? "Parcial (limite de API / alvo)" : "Completa"}
            </span>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-stretch">
        <Card className="bg-card/50 border-border overflow-hidden h-full flex flex-col">
          <CardContent className="p-3 h-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-h-0">
            {rankEmblemUrl ? (
              <LolRankEmblemFrame
                src={rankEmblemUrl}
                alt={rankDisplayLabel}
                frameClass="h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 mx-auto sm:mx-0"
                zoomPercent={172}
              />
            ) : (
              <div className="h-16 w-16 sm:h-[72px] sm:w-[72px] shrink-0 mx-auto sm:mx-0 rounded-xl bg-muted/50 border border-border flex items-center justify-center">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 flex flex-col justify-center text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span className="text-xs font-medium">Rank Atual</span>
              </div>
              <p
                className={`text-base sm:text-lg font-bold leading-snug break-words ${rankTitleClass}`}
              >
                {rankDisplayLabel}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{rankLpText}</p>
            </div>
          </CardContent>
        </Card>
        <StatCard
          icon={<Trophy className="h-4 w-4" />}
          label="Win Rate"
          value={`${overview.winRate}%`}
          accent={winRateAccent}
        />
        <StatCard
          icon={<Target className="h-4 w-4" />}
          label="KDA"
          value={overview.kdaFormatted}
          accent={kdaAccent}
        />
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Horas"
          value={`${overview.timePlayedHours}h`}
          accent="text-neon-blue"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Swords className="h-4 w-4" />
              KDA e Volume
            </h4>
            <div className="space-y-2 text-sm">
              <Row label="Partidas" value={overview.gamesPlayed.toLocaleString()} />
              <Row label="Vitórias" value={overview.wins.toLocaleString()} valueClassName="text-neon-green" />
              <Row label="Derrotas" value={overview.losses.toLocaleString()} valueClassName="text-red-500" />
              <Row label="Kills" value={overview.totals.kills.toLocaleString()} valueClassName="text-neon-green" />
              <Row label="Mortes" value={overview.totals.deaths.toLocaleString()} valueClassName="text-red-500" />
              <Row
                label="Assistências"
                value={overview.totals.assists.toLocaleString()}
                valueClassName="text-sky-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Crosshair className="h-4 w-4" />
              Médias por jogo
            </h4>
            <div className="space-y-2 text-sm">
              <Row label="Kills" value={String(overview.avgKills)} valueClassName="text-neon-green" />
              <Row label="Mortes" value={String(overview.avgDeaths)} valueClassName="text-red-500" />
              <Row label="Assistências" value={String(overview.avgAssists)} valueClassName="text-sky-400" />
              <Row label="CS/jogo" value={String(overview.csPerGame)} valueClassName="text-cyan-300/95" />
              <Row label="CS/min" value={String(overview.csPerMinute)} valueClassName="text-cyan-300/95" />
              <Row
                label="KP%"
                value={`${overview.kpPercent}%`}
                valueClassName={lolWinRateAccentClass(overview.kpPercent)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ranked
            </h4>
            <div className="space-y-3 text-sm">
              {showRankedSoloRow ? (
                <LolRankedQueueBlock
                  queueTitle="Solo / Duo"
                  queue={stats.ranked?.queues?.RANKED_SOLO_5x5}
                />
              ) : null}
              {showRankedFlexRow ? (
                <LolRankedQueueBlock
                  queueTitle="Flex"
                  queue={stats.ranked?.queues?.RANKED_FLEX_SR}
                />
              ) : null}
              {!showRankedSoloRow && !showRankedFlexRow ? (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Solo e Flex não são exibidos para o filtro de fila atual (ex.: ARAM).
                </p>
              ) : null}
              <Row
                label="LP atual"
                value={
                  rankedLpSource
                    ? `${rankedLpSource.leaguePoints.toLocaleString()} LP`
                    : "Sem dados"
                }
              />
              <Row
                label="WR (partidas)"
                value={overview.gamesPlayed > 0 ? rankedWrDisplay : "Sem dados"}
                valueClassName={overview.gamesPlayed > 0 ? rankedWrClass : undefined}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Últimas 20
            </h4>
            <div className="space-y-2 text-sm">
              <Row label="Partidas" value={String(last20?.gamesPlayed ?? 0)} />
              <Row label="Vitórias" value={String(last20?.wins ?? 0)} valueClassName="text-neon-green" />
              <Row label="Derrotas" value={String(last20?.losses ?? 0)} valueClassName="text-red-500" />
              <Row
                label="WR"
                value={`${last20?.winRate ?? 0}%`}
                valueClassName={lolWinRateAccentClass(last20?.winRate ?? 0)}
              />
              <Row
                label="KDA"
                value={last20?.kdaFormatted ?? "0.00:1"}
                valueClassName={lolKdaRatioAccentClass(last20?.kdaRatio ?? 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Campeões mais jogados (Temporada)
            </h4>
            <div className="space-y-2">
              {seasonChampions.map((champion) => (
                <LolChampionOverviewRow
                  key={`${champion.championId}-${champion.championName}`}
                  champion={champion}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Campeões mais jogados (Geral)
            </h4>
            <div className="space-y-2">
              {overallChampions.map((champion) => (
                <LolChampionOverviewRow
                  key={`overall-${champion.championId}-${champion.championName}`}
                  champion={champion}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Roles por filtro
            </h4>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(stats.roleDistribution ?? []).map((role) => (
                  <Badge
                    key={role.role}
                    variant="outline"
                    className="inline-flex max-w-full flex-wrap items-center rounded-full border-border/70 bg-muted/25 py-2 pl-2.5 pr-3 gap-x-2 gap-y-1 text-foreground shadow-none hover:bg-muted/40"
                  >
                    {role.roleIconUrl ? (
                      <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm flex items-center justify-center bg-background/50">
                        <img
                          src={role.roleIconUrl}
                          alt=""
                          className="h-[118%] w-[118%] max-w-none object-cover object-center"
                          title={role.role}
                        />
                      </span>
                    ) : null}
                    <span className="font-semibold tracking-tight">{role.role}</span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {role.games} jogos
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums ${lolWinRateAccentClass(role.winRate)}`}
                    >
                      {role.winRate}% WR
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="p-4">
            <h4 className="font-semibold text-sm text-muted-foreground mb-3">
              Maestria (global da conta)
            </h4>
            <div className="space-y-2">
                {(stats.championMastery ?? []).slice(0, 4).map((mastery) => (
                  <div
                    key={`${mastery.championId}-${mastery.championName}`}
                    className="flex items-center justify-between text-sm gap-3"
                  >
                    <div className="flex items-center gap-2">
                      {mastery.championImageUrl ? (
                        <img
                          src={mastery.championImageUrl}
                          alt={mastery.championName}
                          className="h-7 w-7 rounded-sm border border-border/70"
                        />
                      ) : null}
                      <span className="text-muted-foreground">{mastery.championName}</span>
                    </div>
                    <span className="font-medium">
                      Lv. {mastery.championLevel} · {mastery.championPoints.toLocaleString()} pts
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---- Stat card helper ----

function StatCard({
  icon,
  label,
  value,
  accent,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  subValue?: string;
}) {
  return (
    <Card className="bg-card/50 border-border overflow-hidden h-full flex flex-col">
      <CardContent className="p-3 h-full flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground mb-1">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className={`text-lg font-bold ${accent}`}>{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm items-baseline">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span
        className={`font-medium text-right tabular-nums break-all ${valueClassName ?? "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

function mapLolMatchesToUi(
  matches: LolMatchItem[],
  staticAssets?: LolStatsResponse["staticAssets"],
): Match[] {
  const championIconBase = staticAssets?.championIconBase;
  const cdnBase = staticAssets?.cdnBase;
  return matches.map((match) => {
    const csPerMinute =
      match.durationSeconds > 0
        ? Number((match.cs / (match.durationSeconds / 60)).toFixed(1))
        : undefined;

    const expandedDetails: Match["expandedDetails"] = {
      kills: match.kda.kills,
      deaths: match.kda.deaths,
      assists: match.kda.assists,
      damage: match.damageDealt,
      damageTaken: match.damageTaken,
      cs: match.cs,
      csPerMinute,
      vision: match.visionScore,
      gold: match.gold,
      kdaRatio: match.kda.ratio,
    };

    const viewerParticipant =
      match.matchDetail?.participants.find(
        (participant) =>
          Boolean(match.matchDetail?.viewerPuuid) &&
          participant.puuid === match.matchDetail?.viewerPuuid,
      ) ?? null;
    const blueParticipants =
      match.matchDetail?.participants
        .filter((participant) => participant.teamId === 100)
        .map((participant) => ({
          gameName: participant.gameName,
          championImageUrl:
            championIconBase && participant.championImage
              ? `${championIconBase}/${participant.championImage}`
              : null,
        })) ?? [];
    const redParticipants =
      match.matchDetail?.participants
        .filter((participant) => participant.teamId === 200)
        .map((participant) => ({
          gameName: participant.gameName,
          championImageUrl:
            championIconBase && participant.championImage
              ? `${championIconBase}/${participant.championImage}`
              : null,
        })) ?? [];
    const buildItems =
      viewerParticipant?.items
        ?.filter((itemId) => itemId > 0)
        .slice(0, 6)
        .map((itemId, idx) => ({
          itemId,
          iconUrl: cdnBase ? `${cdnBase}/img/item/${itemId}.png` : "",
          name: viewerParticipant.itemsDetailed?.[idx]?.name,
        }))
        .filter((item) => Boolean(item.iconUrl)) ?? [];

    return {
      id: match.matchId,
      map: match.championName,
      result: match.result,
      lolIsRemake: Boolean(match.isRemake),
      score:
        match.matchDetail?.queueLabel ??
        match.teamPositionLabel ??
        match.teamPosition ??
        "League of Legends",
      kda: match.kda.formatted,
      date: formatTimeAgo(match.gameCreation),
      duration: formatLolDuration(match.durationSeconds),
      lolMatchDetail: match.matchDetail ?? null,
      lolStaticAssets: staticAssets,
      expandedDetails,
      lolPreview: {
        championName: match.championName,
        championImageUrl:
          championIconBase && match.championImage
            ? `${championIconBase}/${match.championImage}`
            : null,
        queueLabel: match.matchDetail?.queueLabel ?? null,
        roleLabel: match.teamPositionLabel ?? match.teamPosition ?? null,
        kdaRatio: match.kda.ratio,
        csPerMinute: csPerMinute ?? null,
        summonerSpell1Url: viewerParticipant?.summonerSpell1Url ?? null,
        summonerSpell2Url: viewerParticipant?.summonerSpell2Url ?? null,
        primaryRuneUrl: viewerParticipant?.primaryRuneUrl ?? null,
        secondaryRuneUrl: viewerParticipant?.secondaryStyleUrl ?? null,
        buildItems,
        blueParticipants,
        redParticipants,
      },
    };
  });
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${minutes}m`;
}

function formatLolDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function formatTimeAgo(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  if (diffHours < 24) {
    return `${diffHours}h atrás`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d atrás`;
  }
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} ${diffWeeks === 1 ? "semana" : "semanas"} atrás`;
}

function parseSlashKda(formatted: string): { k: number; d: number; a: number } | null {
  const m = formatted.trim().match(/^(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  return { k: Number(m[1]), d: Number(m[2]), a: Number(m[3]) };
}

function lolKdaPerformanceTone(ratio: number | null | undefined): "bad" | "ok" | "good" {
  if (ratio == null || Number.isNaN(ratio)) return "ok";
  if (ratio < 1) return "bad";
  if (ratio < 2) return "ok";
  return "good";
}

function lolKdaToneClasses(tone: "bad" | "ok" | "good"): string {
  if (tone === "bad") return "text-rose-400";
  if (tone === "ok") return "text-amber-300";
  return "text-emerald-400";
}

// ---- Match History ----

function MatchHistory({
  matches,
  gameId,
  expandedMatch,
  onToggleExpand,
  onLoadMore,
  loadingMore,
  hasMore,
  loadMoreDisabled = false,
  loadMoreDisabledLabel,
}: {
  matches: Match[];
  gameId: GameId;
  expandedMatch: string | null;
  onToggleExpand: (id: string | null) => void;
  onLoadMore: () => void;
  loadingMore: boolean;
  hasMore: boolean;
  loadMoreDisabled?: boolean;
  loadMoreDisabledLabel?: string;
}) {
  const getLolQueueBadgeClass = (queueLabel?: string | null) => {
    const queue = (queueLabel ?? "").toLowerCase();
    if (queue.includes("solo")) return "bg-rose-500/15 text-rose-200 border-rose-500/40";
    if (queue.includes("flex")) return "bg-blue-500/15 text-blue-200 border-blue-500/40";
    if (queue.includes("aram")) return "bg-violet-500/15 text-violet-200 border-violet-500/40";
    return "bg-muted/50 text-muted-foreground border-border/70";
  };

  const lolKdaBlock = (match: Match) => {
    const ratio =
      match.lolPreview?.kdaRatio ??
      match.expandedDetails?.kdaRatio ??
      (match.expandedDetails &&
      match.expandedDetails.deaths > 0 &&
      match.expandedDetails.kills != null &&
      match.expandedDetails.assists != null
        ? (match.expandedDetails.kills + match.expandedDetails.assists) /
          match.expandedDetails.deaths
        : null);
    const toneCls = match.lolIsRemake
      ? "text-zinc-400"
      : lolKdaToneClasses(lolKdaPerformanceTone(ratio));
    const parts = parseSlashKda(match.kda);

    return (
      <div className="mt-0.5 space-y-0.5">
        {parts ? (
          <div
            className={`flex flex-wrap items-baseline gap-x-1 text-[15px] font-bold tabular-nums leading-tight tracking-tight sm:text-base ${toneCls}`}
          >
            <span>{parts.k}</span>
            <span className="text-[0.85em] font-semibold text-muted-foreground/70">/</span>
            <span>{parts.d}</span>
            <span className="text-[0.85em] font-semibold text-muted-foreground/70">/</span>
            <span>{parts.a}</span>
          </div>
        ) : (
          <div
            className={`text-[15px] font-bold tabular-nums leading-tight sm:text-base ${toneCls}`}
          >
            {match.kda}
          </div>
        )}
        {ratio != null && Number.isFinite(ratio) ? (
          <div className={`text-xs font-semibold tabular-nums sm:text-sm ${toneCls} opacity-95`}>
            {ratio.toFixed(2)} KDA
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Partidas Recentes</h3>
        <div className="space-y-2">
          {matches.map((match) => {
            const isLolRemake = gameId === "lol" && Boolean(match.lolIsRemake);
            return (
            <Collapsible
              key={match.id}
              open={expandedMatch === match.id}
              onOpenChange={(open) => onToggleExpand(open ? match.id : null)}
            >
              <div
                className={`rounded-lg border transition-colors ${
                  expandedMatch === match.id
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/50 bg-card/30 hover:bg-card/50"
                }`}
              >
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between overflow-visible p-3 text-left">
                    {gameId === "lol" ? (
                      <>
                        <div className="flex min-w-0 items-start gap-3 sm:gap-4 overflow-visible">
                          <div
                            className={`w-2 self-stretch shrink-0 rounded-full ${
                              isLolRemake
                                ? "bg-zinc-500/85"
                                : match.result === "win"
                                  ? "bg-emerald-500/90"
                                  : "bg-rose-500/90"
                            }`}
                          />
                          <div className="flex shrink-0 flex-col items-stretch gap-1.5 self-center text-center">
                            <div className="flex w-[5.5rem] shrink-0 flex-col items-center gap-1.5">
                              <span
                                className="line-clamp-2 w-full text-center text-[11px] font-bold leading-tight text-foreground sm:text-xs"
                                title={
                                  match.lolPreview?.championName?.trim() ||
                                  match.map
                                }
                              >
                                {match.lolPreview?.championName?.trim() ||
                                  match.map}
                              </span>
                              <div className="flex justify-center">
                                {match.lolPreview?.championImageUrl ? (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-visible rounded-md border border-border/70 bg-black/20">
                                    <img
                                      src={match.lolPreview.championImageUrl}
                                      alt={
                                        match.lolPreview?.championName?.trim() ||
                                        match.map
                                      }
                                      className="max-h-10 max-w-10 object-contain"
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex justify-center gap-1">
                              {match.lolPreview?.summonerSpell1Url ? (
                                <img
                                  src={match.lolPreview.summonerSpell1Url}
                                  alt="Spell 1"
                                  className="h-4 w-4 rounded-sm border border-border/70 object-cover"
                                />
                              ) : null}
                              {match.lolPreview?.summonerSpell2Url ? (
                                <img
                                  src={match.lolPreview.summonerSpell2Url}
                                  alt="Spell 2"
                                  className="h-4 w-4 rounded-sm border border-border/70 object-cover"
                                />
                              ) : null}
                            </div>
                            <div
                              className={`rounded-md border px-2 py-1 text-[11px] font-semibold leading-none ${
                                isLolRemake
                                  ? "border-zinc-600/70 bg-zinc-900/60 text-zinc-400"
                                  : match.result === "win"
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                    : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                              }`}
                            >
                              {isLolRemake ? "Remake" : match.result === "win" ? "Vitória" : "Derrota"}
                            </div>
                            <div
                              className={`h-px w-full ${
                                isLolRemake
                                  ? "bg-zinc-600/55"
                                  : match.result === "win"
                                    ? "bg-emerald-500/35"
                                    : "bg-rose-500/35"
                              }`}
                              aria-hidden
                            />
                            <div className="flex flex-col gap-0.5 text-[10px] leading-tight">
                              <span className="font-medium text-foreground/90">
                                {match.date}
                              </span>
                              <span className="text-muted-foreground">
                                Duração:{" "}
                                <span className="tabular-nums text-foreground/80">
                                  {match.duration}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            {lolKdaBlock(match)}
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                              {match.lolPreview?.queueLabel ? (
                                <span
                                  className={`rounded-full border px-2 py-0.5 ${getLolQueueBadgeClass(match.lolPreview.queueLabel)}`}
                                >
                                  {match.lolPreview.queueLabel}
                                </span>
                              ) : null}
                              {match.lolPreview?.roleLabel ? (
                                <span className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-muted-foreground">
                                  {match.lolPreview.roleLabel}
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                              {(match.lolPreview?.primaryRuneUrl || match.lolPreview?.secondaryRuneUrl) && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5">
                                  {match.lolPreview?.primaryRuneUrl ? (
                                    <img
                                      src={match.lolPreview.primaryRuneUrl}
                                      alt="Runa primária"
                                      className="h-3.5 w-3.5 rounded-full"
                                    />
                                  ) : null}
                                  {match.lolPreview?.secondaryRuneUrl ? (
                                    <img
                                      src={match.lolPreview.secondaryRuneUrl}
                                      alt="Runa secundária"
                                      className="h-3.5 w-3.5 rounded-full"
                                    />
                                  ) : null}
                                  <span>Runas</span>
                                </span>
                              )}
                              {match.lolPreview?.buildItems && match.lolPreview.buildItems.length > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-2 py-0.5">
                                  <span>Build</span>
                                  <span className="inline-flex items-center gap-0.5">
                                    {match.lolPreview.buildItems.map((item) => (
                                      <img
                                        key={`${match.id}-item-${item.itemId}`}
                                        src={item.iconUrl}
                                        alt={item.name ?? `Item ${item.itemId}`}
                                        className="h-4 w-4 rounded-[3px] border border-border/70 object-cover"
                                      />
                                    ))}
                                  </span>
                                </span>
                              ) : null}
                            </div>
                            {(match.lolPreview?.blueParticipants?.length ||
                              match.lolPreview?.redParticipants?.length) ? (
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-2 py-0.5">
                                  <span className="text-blue-200">Azul</span>
                                  <span className="inline-flex items-center gap-1">
                                    {match.lolPreview?.blueParticipants?.map((participant, index) => (
                                      <span
                                        key={`${match.id}-blue-${participant.gameName}-${index}`}
                                        className="inline-flex items-center gap-0.5 max-w-[96px]"
                                      >
                                        {participant.championImageUrl ? (
                                          <img
                                            src={participant.championImageUrl}
                                            alt={participant.gameName}
                                            className="h-3.5 w-3.5 rounded-[3px] border border-blue-300/40 object-cover"
                                          />
                                        ) : null}
                                        <span className="truncate text-blue-100">{participant.gameName}</span>
                                      </span>
                                    ))}
                                  </span>
                                </div>
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/10 px-2 py-0.5">
                                  <span className="text-rose-200">Vermelho</span>
                                  <span className="inline-flex items-center gap-1">
                                    {match.lolPreview?.redParticipants?.map((participant, index) => (
                                      <span
                                        key={`${match.id}-red-${participant.gameName}-${index}`}
                                        className="inline-flex items-center gap-0.5 max-w-[96px]"
                                      >
                                        {participant.championImageUrl ? (
                                          <img
                                            src={participant.championImageUrl}
                                            alt={participant.gameName}
                                            className="h-3.5 w-3.5 rounded-[3px] border border-rose-300/40 object-cover"
                                          />
                                        ) : null}
                                        <span className="truncate text-rose-100">{participant.gameName}</span>
                                      </span>
                                    ))}
                                  </span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-4">
                          <div className="hidden min-w-[190px] md:block text-right">
                            <div className="text-xs text-muted-foreground">
                              Dano{" "}
                              <span className="font-medium text-foreground">
                                {match.expandedDetails?.damage?.toLocaleString() ?? "-"}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              CS{" "}
                              <span className="font-medium text-foreground">
                                {match.expandedDetails?.cs ?? "-"}
                              </span>
                              {match.lolPreview?.csPerMinute != null
                                ? ` (${match.lolPreview.csPerMinute.toFixed(1)}/m)`
                                : ""}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Visao{" "}
                              <span className="font-medium text-foreground">
                                {match.expandedDetails?.vision ?? "-"}
                              </span>
                            </div>
                          </div>
                          {expandedMatch === match.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              match.result === "win"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {match.result === "win" ? "V" : "D"}
                          </div>
                          <div>
                            <div className="font-medium">{match.map}</div>
                            <div className="text-sm text-muted-foreground">{match.kda}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-medium">{match.score}</div>
                            <div className="flex flex-col gap-0.5 text-right text-xs leading-tight text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {match.date}
                              </span>
                              <span>
                                Duração:{" "}
                                <span className="tabular-nums text-foreground/90">
                                  {match.duration}
                                </span>
                              </span>
                            </div>
                          </div>
                          {expandedMatch === match.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </>
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  {gameId === "lol" && match.lolMatchDetail ? (
                    <div className="px-1 pb-2 sm:px-2">
                      <LolMatchHistoryDetail
                        detail={match.lolMatchDetail}
                        staticAssets={match.lolStaticAssets}
                      />
                    </div>
                  ) : null}
                  {gameId !== "lol" && match.expandedDetails && (
                    <div className="px-3 pb-3 pt-0 border-t border-border/50 mt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 text-sm">
                        {match.expandedDetails.headshotPct != null && (
                          <div>
                            <span className="text-muted-foreground">HS%</span>
                            <p className="font-medium">
                              {match.expandedDetails.headshotPct}%
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.adr != null && (
                          <div>
                            <span className="text-muted-foreground">ADR</span>
                            <p className="font-medium">
                              {match.expandedDetails.adr}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.acs != null && (
                          <div>
                            <span className="text-muted-foreground">ACS</span>
                            <p className="font-medium">
                              {match.expandedDetails.acs}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.firstBloods != null && (
                          <div>
                            <span className="text-muted-foreground">
                              First Blood
                            </span>
                            <p className="font-medium">
                              {match.expandedDetails.firstBloods}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.mvps != null && (
                          <div>
                            <span className="text-muted-foreground">MVPs</span>
                            <p className="font-medium">
                              {match.expandedDetails.mvps}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.damage != null && (
                          <div>
                            <span className="text-muted-foreground">Dano</span>
                            <p className="font-medium">
                              {match.expandedDetails.damage?.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.damageTaken != null && (
                          <div>
                            <span className="text-muted-foreground">Dano recebido</span>
                            <p className="font-medium">
                              {match.expandedDetails.damageTaken?.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.cs != null && (
                          <div>
                            <span className="text-muted-foreground">CS</span>
                            <p className="font-medium">
                              {match.expandedDetails.cs}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.csPerMinute != null && (
                          <div>
                            <span className="text-muted-foreground">CS/min</span>
                            <p className="font-medium">{match.expandedDetails.csPerMinute.toFixed(1)}</p>
                          </div>
                        )}
                        {match.expandedDetails.vision != null && (
                          <div>
                            <span className="text-muted-foreground">Visão</span>
                            <p className="font-medium">
                              {match.expandedDetails.vision}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.gold != null && (
                          <div>
                            <span className="text-muted-foreground">Ouro</span>
                            <p className="font-medium">
                              {match.expandedDetails.gold?.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.kdaRatio != null && (
                          <div>
                            <span className="text-muted-foreground">KDA Ratio</span>
                            <p className="font-medium">{match.expandedDetails.kdaRatio.toFixed(2)}:1</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {gameId === "lol" && !match.lolMatchDetail && match.expandedDetails ? (
                    <div className="px-3 pb-3 pt-0 border-t border-border/50 mt-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 text-sm">
                        {match.expandedDetails.damage != null && (
                          <div>
                            <span className="text-muted-foreground">Dano</span>
                            <p className="font-medium">
                              {match.expandedDetails.damage?.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {match.expandedDetails.cs != null && (
                          <div>
                            <span className="text-muted-foreground">CS</span>
                            <p className="font-medium">{match.expandedDetails.cs}</p>
                          </div>
                        )}
                        {match.expandedDetails.vision != null && (
                          <div>
                            <span className="text-muted-foreground">Visão</span>
                            <p className="font-medium">{match.expandedDetails.vision}</p>
                          </div>
                        )}
                        {match.expandedDetails.gold != null && (
                          <div>
                            <span className="text-muted-foreground">Ouro</span>
                            <p className="font-medium">
                              {match.expandedDetails.gold?.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground px-3 pb-2">
                        Detalhe completo da partida (todos os jogadores) aparece após a próxima sincronização com a
                        Riot.
                      </p>
                    </div>
                  ) : null}
                </CollapsibleContent>
              </div>
            </Collapsible>
            );
          })}
        </div>
        {hasMore ? (
          <Button
            variant="outline"
            className="w-full mt-4 border-border"
            onClick={onLoadMore}
            disabled={loadingMore || loadMoreDisabled}
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {loadMoreDisabled ? (loadMoreDisabledLabel ?? "Sincronizando...") : "Carregar mais"}
          </Button>
        ) : (
          <p className="text-center mt-4 text-xs text-muted-foreground">
            Sem mais partidas para carregar neste filtro.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

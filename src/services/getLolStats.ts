import { apiFetch } from "@/services/apiFetch";

export type LolTimeScope = "platform" | "season";
export type LolQueueScope =
  | "all"
  | "competitive"
  | "ranked_solo"
  | "ranked_flex"
  | "aram";

export type LolRuneIcon = {
  id: number;
  iconUrl: string;
  name?: string;
  description?: string;
};

export type LolItemDetail = {
  id: number;
  name: string;
  description: string;
};

export type LolMatchDetailParticipant = {
  puuid: string;
  riotId: string;
  gameName: string;
  tagLine: string;
  teamId: number;
  win: boolean;
  championId: number;
  championName: string;
  championImage: string;
  summonerLevel: number;
  summonerSpell1Id: number;
  summonerSpell2Id: number;
  summonerSpell1Url: string | null;
  summonerSpell2Url: string | null;
  summonerSpell1Name?: string;
  summonerSpell1Description?: string;
  summonerSpell2Name?: string;
  summonerSpell2Description?: string;
  primaryRuneId: number;
  secondaryStyleId: number;
  primaryRuneUrl: string | null;
  secondaryStyleUrl: string | null;
  runes: LolRuneIcon[];
  rankDisplay: string | null | undefined;
  /** Tier code from ranked API (e.g. PLATINUM); used to build emblem URL if icon missing. */
  rankTier?: string | null;
  rankTierIconUrl?: string | null;
  rankLine?: string | null;
  lane: string;
  laneLabel: string;
  laneIconUrl?: string | null;
  kills: number;
  deaths: number;
  assists: number;
  kdaRatio: number;
  killParticipationPct: number;
  cs: number;
  csPerMinute: number;
  gold: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  controlWardsPurchased: number;
  damageDealtToChampions: number;
  damageTaken: number;
  totalDamageDealt: number;
  damageTeamPctBar: number;
  items: number[];
  itemsDetailed?: LolItemDetail[];
};

export type LolBan = {
  championId: number;
  championName: string;
  championImage: string;
};

export type LolMatchDetail = {
  queueId: number;
  queueLabel: string;
  gameVersion: string;
  durationSeconds: number;
  gameCreation: string;
  viewerPuuid: string | null | undefined;
  viewerResult?: "win" | "loss" | null;
  /** Riot: participant.gameEndedInEarlySurrender (remake / early end). */
  isRemake?: boolean;
  showRankAndRole?: boolean;
  teams: Record<
    string,
    {
      teamId: number;
      win: boolean;
      kills: number;
      gold: number;
      objectives: Record<string, number>;
      bans?: LolBan[];
    }
  >;
  participants: LolMatchDetailParticipant[];
  summary: {
    blueKills: number;
    redKills: number;
    blueGold: number;
    redGold: number;
    killBarBluePct: number;
    killBarRedPct: number;
    goldBarBluePct: number;
    goldBarRedPct: number;
  };
};

export type LolMatchItem = {
  matchId: string;
  championId: number;
  championName: string;
  championImage?: string;
  queueId: number;
  seasonKey: string;
  /** Riot: participant.gameEndedInEarlySurrender (remake / early end). */
  isRemake?: boolean;
  result: "win" | "loss";
  kda: {
    kills: number;
    deaths: number;
    assists: number;
    formatted: string;
    ratio: number;
  };
  cs: number;
  visionScore: number;
  gold: number;
  damageDealt: number;
  damageTaken: number;
  teamPosition?: string | null;
  teamPositionLabel?: string | null;
  gameCreation: string;
  durationSeconds: number;
  matchDetail?: LolMatchDetail | null;
};

export type LolStatsResponse = {
  available: boolean;
  reason?: string;
  syncWarning?: string | null;
  account?: {
    gameName: string;
    tagLine: string;
    riotId: string;
    puuid?: string | null;
    profileIcon?: number | null;
    summonerLevel?: number | null;
    platformRegion?: string | null;
    lastSyncedAt?: string | null;
    source?: string | null;
    profileIconUrl?: string | null;
  };
  ranked?: {
    current?: {
      label: string | null;
      leaguePoints: number;
      tier?: string;
      rank?: string;
      iconUrl?: string | null;
    } | null;
    selectedQueueRanked?: {
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
      winRate: number;
      label: string | null;
      iconUrl?: string | null;
    } | null;
    queues: Record<
      string,
      {
        queueType: string;
        tier: string;
        rank: string;
        leaguePoints: number;
        wins: number;
        losses: number;
        winRate: number;
        label: string | null;
        iconUrl?: string | null;
      }
    >;
  };
  overview?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    kdaRatio: number;
    kdaFormatted: string;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
    csPerGame: number;
    csPerMinute: number;
    avgVisionScore: number;
    avgGold: number;
    avgDamageDealt: number;
    avgDamageTaken: number;
    kpPercent: number;
    timePlayedHours: number;
    totals: {
      kills: number;
      deaths: number;
      assists: number;
      cs: number;
      visionScore: number;
      damageDealt: number;
      damageTaken: number;
      gold: number;
    };
  };
  champions?: Array<{
    championId: number;
    championName: string;
    games: number;
    wins: number;
    winRate: number;
    kda: number;
    killsAvg: number;
    deathsAvg: number;
    assistsAvg: number;
    csAvg: number;
    championImageUrl?: string | null;
  }>;
  championsSeason?: Array<{
    championId: number;
    championName: string;
    games: number;
    wins: number;
    losses?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    winRate: number;
    kda: number;
    killsAvg: number;
    deathsAvg: number;
    assistsAvg: number;
    csAvg: number;
    championImageUrl?: string | null;
    /** Maestria na conta Riot (0 se sem registo). */
    championLevel?: number;
    championPoints?: number;
  }>;
  /** Preview resumido: mesmo recorte que championsOverallModal (plataforma, todas as temporadas, fila do filtro). */
  championsOverall?: Array<{
    championId: number;
    championName: string;
    games: number;
    wins: number;
    losses?: number;
    kills?: number;
    deaths?: number;
    assists?: number;
    winRate: number;
    kda: number;
    killsAvg: number;
    deathsAvg: number;
    assistsAvg: number;
    csAvg: number;
    championImageUrl?: string | null;
    championLevel?: number;
    championPoints?: number;
  }>;
  /** Modal Ver todos geral: campeões com maestria na conta e stats do histórico plataforma na fila do filtro atual (todas as temporadas) quando existirem. */
  championsOverallModal?: Array<{
    championId: number;
    championName: string;
    championLevel: number;
    championPoints: number;
    championImageUrl?: string | null;
    lastPlayTime?: string | null;
    syncedMatchStats?: {
      games: number;
      wins: number;
      losses: number;
      kills: number;
      deaths: number;
      assists: number;
      winRate: number;
      kda: number;
    } | null;
  }>;
  roleDistribution?: Array<{
    role: string;
    games: number;
    winRate: number;
    roleIconUrl?: string | null;
  }>;
  recentMatches?: LolMatchItem[];
  historyPage?: {
    items: LolMatchItem[];
    nextCursor?: string | null;
    hasMore: boolean;
    limit: number;
  };
  last20Summary?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    kdaRatio: number;
    kdaFormatted: string;
    avgKills: number;
    avgDeaths: number;
    avgAssists: number;
  };
  championMastery?: Array<{
    championId: number;
    championName: string;
    championImage?: string;
    championImageUrl?: string | null;
    championPoints: number;
    championLevel: number;
  }>;
  /** Lista completa de maestrias (mesmo formato que championMastery) para o modal Ver todos. */
  championMasteryAll?: Array<{
    championId: number;
    championName: string;
    championImage?: string;
    championImageUrl?: string | null;
    championPoints: number;
    championLevel: number;
  }>;
  seasonOptions?: Array<{ key: string; label: string }>;
  dataCompleteness?: {
    isPartial: boolean;
    reason?: string | null;
    seasonMatchesSynced: number;
    totalMatchesSynced: number;
    historyCursor: number;
  };
  syncStatus?: {
    state: string;
    message?: string | null;
    lastSyncedAt?: string | null;
  };
  staticAssets?: {
    version: string;
    cdnBase: string;
    profileIconBase: string;
    championIconBase: string;
  };
  appliedFilters?: {
    timeScope: LolTimeScope;
    queueScope: LolQueueScope;
    seasonKey?: string | null;
  };
  disclaimers?: string[];
};

export async function getLolStats(
  profileId: number,
  options?: {
    timeScope?: LolTimeScope;
    queueScope?: LolQueueScope;
    seasonId?: string | null;
  }
): Promise<LolStatsResponse> {
  const params = new URLSearchParams();
  if (options?.timeScope) params.set("time_scope", options.timeScope);
  if (options?.queueScope) params.set("queue_scope", options.queueScope);
  if (options?.seasonId) params.set("season_id", options.seasonId);
  const query = params.toString();
  const url = query
    ? `/api/games/profiles/${profileId}/lol/stats/?${query}`
    : `/api/games/profiles/${profileId}/lol/stats/`;

  const res = await apiFetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch LoL stats");
  }
  return (await res.json()) as LolStatsResponse;
}

export async function getLolHistory(
  profileId: number,
  options?: {
    timeScope?: LolTimeScope;
    queueScope?: LolQueueScope;
    seasonId?: string | null;
    cursor?: string | null;
    limit?: number;
  }
): Promise<
  Pick<
    LolStatsResponse,
    "available" | "historyPage" | "appliedFilters" | "dataCompleteness" | "syncStatus"
  >
> {
  const params = new URLSearchParams();
  if (options?.timeScope) params.set("time_scope", options.timeScope);
  if (options?.queueScope) params.set("queue_scope", options.queueScope);
  if (options?.seasonId) params.set("season_id", options.seasonId);
  if (options?.cursor) params.set("cursor", options.cursor);
  if (options?.limit) params.set("limit", String(options.limit));
  const query = params.toString();
  const url = query
    ? `/api/games/profiles/${profileId}/lol/history/?${query}`
    : `/api/games/profiles/${profileId}/lol/history/`;

  const res = await apiFetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch LoL history");
  }
  return (await res.json()) as Pick<
    LolStatsResponse,
    "available" | "historyPage" | "appliedFilters" | "dataCompleteness" | "syncStatus"
  >;
}

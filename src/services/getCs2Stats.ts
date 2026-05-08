import { apiFetch } from "@/services/apiFetch";

export type Cs2StatsResponse = {
  available: boolean;
  steam_profile_public?: boolean;
  reason?: string;
  last_updated?: string;
  force_refresh?: {
    cooldown_seconds: number;
    next_allowed_at: string;
    remaining_seconds: number;
    allowed: boolean;
    blocked_by_cooldown: boolean;
  };
  stats?: {
    totalKills: number;
    totalDeaths: number;
    kd: number;
    kdFormatted: string;
    totalRoundsPlayed: number;
    totalMatchesPlayed: number;
    totalMatchesWon: number;
    winrate: number;
    totalHours: number;
    totalHeadshots: number;
    headshotPct: number;
    totalShotsFired: number;
    totalShotsHit: number;
    accuracy: number;
    shotsPerKill: number;
    totalPlants: number;
    totalDefuses: number;
    defusePlantRatio: number;
    totalWins: number;
    totalMvps: number;
    totalWinsPistolRound: number;
    totalKillsKnife: number;
    totalKillsHegrenade: number;
    totalKillsMolotov: number;
    totalShotsTaser: number;
    totalKillsAgainstZoomedSniper: number;
    ctVsTRatio: number;
    ctWeaponKills: { name: string; kills: number; pct: number }[];
    sniperStats: { totalKills: number; pct: number; killsVsZoomed: number };
    weapons: { name: string; kills: number; pct: number }[];
    alternativeWeapons: { name: string; kills: number; pct: number }[];
    mapWinRates: {
      map: string;
      winPct: number;
      wins: number;
      losses: number;
    }[];
    weaponAccuracies: Record<string, number>;
    versatility: number;
    allWeaponKills?: { name: string; kills: number; pct: number }[];
  };
};

export async function getCs2Stats(
  profileId: number,
  options?: { force?: boolean }
): Promise<Cs2StatsResponse> {
  const q =
    options?.force === true
      ? "?force_refresh=1"
      : "";
  const res = await apiFetch(
    `/api/games/profiles/${profileId}/cs2/stats/${q}`,
    { method: "GET", credentials: "include" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch CS2 stats");
  }
  return (await res.json()) as Cs2StatsResponse;
}

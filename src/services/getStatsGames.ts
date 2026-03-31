import { apiFetch } from "@/services/apiFetch";

export type StatsGame = {
  slug: string;
  available: boolean;
  steam_profile_public?: boolean;
};

export type StatsGamesResponse = {
  games: StatsGame[];
};

export async function getStatsGames(
  profileId: number
): Promise<StatsGamesResponse> {
  const res = await apiFetch(
    `/api/games/profiles/${profileId}/stats-games/`,
    { method: "GET", credentials: "include" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch stats games");
  }
  return (await res.json()) as StatsGamesResponse;
}

import { apiFetch } from "@/services/apiFetch";
import type { RarityLevel } from "@/components/pages/profile/rarityConfig";

export type ProfileAchievementProgression = {
  path: number[];
  current: number;
  next: number;
  unit: string;
};

export type ProfileAchievementApi = {
  id: number;
  code: string;
  title: string;
  description: string;
  rarity: RarityLevel;
  icon: string;
  icon_image_url: string | null;
  game: string;
  game_slug: string;
  date: string;
  percentage: number;
  points: number;
  unlocked: boolean;
  unlocked_at: string | null;
  group_code: string | null;
  order_in_group: number;
  checkpoint_value: number | null;
  progression: ProfileAchievementProgression | null;
};

export type ProfileAchievementsResponse = {
  achievements: ProfileAchievementApi[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  /** ISO datetime por slug (csgo, playgether, lol, …) após sync bem-sucedido. */
  achievement_last_sync_by_slug?: Record<string, string>;
};

export type GetProfileAchievementsParams = {
  page?: number;
  page_size?: number;
  game_slugs?: string[];
  /** Valores de `rarity` separados por vírgula na query; omitir = todos os níveis. */
  rarities?: string[];
};

export async function getProfileAchievements(
  profileId: number,
  params?: GetProfileAchievementsParams,
): Promise<ProfileAchievementsResponse> {
  const search = new URLSearchParams();
  if (params?.page != null) search.set("page", String(params.page));
  if (params?.page_size != null) search.set("page_size", String(params.page_size));
  if (params?.game_slugs?.length) {
    search.set("game_slugs", params.game_slugs.join(","));
  }
  if (params?.rarities?.length) {
    search.set("rarities", params.rarities.join(","));
  }
  const qs = search.toString();
  const path = `/api/games/profiles/${profileId}/achievements/${qs ? `?${qs}` : ""}`;
  const res = await apiFetch(path, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch achievements");
  }
  return (await res.json()) as ProfileAchievementsResponse;
}

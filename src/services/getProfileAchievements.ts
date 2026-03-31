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
};

export async function getProfileAchievements(
  profileId: number
): Promise<ProfileAchievementsResponse> {
  const res = await apiFetch(
    `/api/games/profiles/${profileId}/achievements/`,
    { method: "GET", credentials: "include" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch achievements");
  }
  return (await res.json()) as ProfileAchievementsResponse;
}

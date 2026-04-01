import type { RarityLevel } from "@/components/pages/profile/rarityConfig";

/** Payload compacto vindo da API (perfil, posts, comentários). */
export type HighlightedAchievementPublic = {
  id: number;
  code: string;
  title: string;
  description: string;
  rarity: RarityLevel | string;
  icon: string;
  icon_image_url: string | null;
  game: string;
  game_slug: string;
  game_short: string;
  date: string;
  unlocked_at: string | null;
  percentage: number;
};

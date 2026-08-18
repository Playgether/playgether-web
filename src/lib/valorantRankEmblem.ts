import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

const TIER_TO_SLUG: Record<string, string> = {
  IRON: "iron",
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  DIAMOND: "diamond",
  ASCENDANT: "ascendant",
  IMMORTAL: "immortal",
  RADIANT: "radiant",
};

/** @param tierDisplay e.g. schema value "Gold" or "GOLD" */
export function valorantTierEmblemUrl(tierDisplay: string): string | null {
  const key = tierDisplay.trim().toUpperCase();
  const slug = TIER_TO_SLUG[key];
  if (!slug) return null;
  return getCloudinaryUrl(`games/val/ranks/${slug}`, 256);
}

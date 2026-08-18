import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";

const TIER_TO_FILENAME: Record<string, string> = {
  IRON: "iron",
  BRONZE: "bronze",
  SILVER: "silver",
  GOLD: "gold",
  PLATINUM: "platinum",
  EMERALD: "emerald",
  DIAMOND: "diamond",
  MASTER: "master",
  GRANDMASTER: "grandmaster",
  CHALLENGER: "challenger",
};

/** @param tierDisplay e.g. schema value "Iron" or API tier "GOLD" */
export function lolTierEmblemUrl(tierDisplay: string): string | null {
  const key = tierDisplay.trim().toUpperCase();
  const fname = TIER_TO_FILENAME[key];
  if (!fname) return null;
  return getCloudinaryUrl(`games/lol/ranks/${fname}`, 256);
}

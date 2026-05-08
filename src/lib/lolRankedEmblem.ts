/**
 * Ranked tier crests (Community Dragon), aligned with games/services/lol_stats_service.py.
 */
const TIER_TO_FILENAME: Record<string, string> = {
  IRON: "Iron",
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
  PLATINUM: "Platinum",
  EMERALD: "Emerald",
  DIAMOND: "Diamond",
  MASTER: "Master",
  GRANDMASTER: "Grandmaster",
  CHALLENGER: "Challenger",
};

const BASE =
  "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem";

/** @param tierDisplay e.g. schema value "Iron" or API tier "GOLD" */
export function lolTierEmblemUrl(tierDisplay: string): string | null {
  const key = tierDisplay.trim().toUpperCase();
  const fname = TIER_TO_FILENAME[key];
  if (!fname) return null;
  return `${BASE}/emblem-${fname.toLowerCase()}.png`;
}

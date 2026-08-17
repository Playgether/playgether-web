/**
 * Competitive tier icons (valorant-api.com), aligned with duo VAL_TIERS.
 * Uses division base icon (e.g. Gold 1 for "Gold").
 */
const EPISODE_ACT_TIER_SET = "03621f52-342b-cf4e-4f86-9350a49c6d04";

const TIER_TO_NUMBER: Record<string, number> = {
  IRON: 3,
  BRONZE: 6,
  SILVER: 9,
  GOLD: 12,
  PLATINUM: 15,
  DIAMOND: 18,
  ASCENDANT: 21,
  IMMORTAL: 24,
  RADIANT: 27,
};

const BASE = `https://media.valorant-api.com/competitivetiers/${EPISODE_ACT_TIER_SET}`;

/** @param tierDisplay e.g. schema value "Gold" or "GOLD" */
export function valorantTierEmblemUrl(tierDisplay: string): string | null {
  const key = tierDisplay.trim().toUpperCase();
  const tierNum = TIER_TO_NUMBER[key];
  if (!tierNum) return null;
  return `${BASE}/${tierNum}/largeicon.png`;
}

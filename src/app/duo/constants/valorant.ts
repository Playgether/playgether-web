export const VAL_ROLES = [
  "Duelista",
  "Iniciador",
  "Controlador",
  "Sentinela",
] as const;

export const VAL_TIERS = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Ascendant",
  "Immortal",
  "Radiant",
] as const;

export const VAL_RANK_COLORS: Record<string, string> = {
  Iron: "text-gray-400",
  Bronze: "text-amber-700",
  Silver: "text-gray-300",
  Gold: "text-yellow-400",
  Platinum: "text-teal-400",
  Diamond: "text-blue-400",
  Ascendant: "text-emerald-400",
  Immortal: "text-red-500",
  Radiant: "text-yellow-300",
};

import type { RarityConfig, RarityLevel } from "./rarityConfig";

export type ElectricSparkData = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  duration: number;
  delay: number;
  repeatDelay: number;
};

export function buildElectricSparks(config: RarityConfig): ElectricSparkData[] {
  const dScale = config.electricSparkDurationScale ?? 1;
  const rScale = config.electricSparkRepeatScale ?? 1;
  return Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 90,
    y: Math.random() * 90,
    rotation: Math.random() * 360,
    duration: (0.2 + Math.random() * 0.2) * dScale,
    delay: Math.random() * 2,
    repeatDelay: (1 + Math.random() * 2.5) * rScale,
  }));
}

export function electricSparkColorForRarity(rarity: RarityLevel): string {
  if (rarity === "legendary") return "rgba(251,191,36,0.9)";
  if (rarity === "celestial") return "rgba(147,197,253,0.95)";
  return "rgba(196,181,253,0.9)";
}

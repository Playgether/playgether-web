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

/** PRNG determinístico por seed (evita padrão idêntico em todas as tags da mesma raridade). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Converte `useId()` (ou qualquer string) em inteiro para seed estável. */
export function hashInstanceSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0 || 1;
}

export function buildElectricSparks(
  config: RarityConfig,
  seed: number,
): ElectricSparkData[] {
  const rand = mulberry32(seed);
  const dScale = config.electricSparkDurationScale ?? 1;
  const rScale = config.electricSparkRepeatScale ?? 1;
  const count = 6 + Math.floor(rand() * 5);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 3 + rand() * 94,
    y: 3 + rand() * 94,
    rotation: rand() * 360,
    duration: (0.14 + rand() * 0.42) * dScale,
    delay: rand() * 3.2,
    repeatDelay: (0.35 + rand() * 3.8) * rScale,
  }));
}

export function electricSparkColorForRarity(rarity: RarityLevel): string {
  if (rarity === "legendary") return "rgba(251,191,36,0.9)";
  if (rarity === "celestial") return "rgba(147,197,253,0.95)";
  return "rgba(196,181,253,0.9)";
}

export type RarityLevel =
  | "common"
  | "medium"
  | "rare"
  | "ultra-rare"
  | "epic"
  | "mythic"
  | "legendary"
  | "celestial";

export interface RarityConfig {
  label: string;
  icon: string;
  glowBase: string;
  glowHover: string;
  glowExpanded: string;
  cardBg: string;
  borderGradient: string;
  staticBorderColor: string;
  textColor: string;
  badgeGradient: string;
  animationIntensity: "none" | "low" | "medium" | "high" | "extreme";
  hasParticles: boolean;
  particleCount: number;
  particleColors: string[];
  hasElectricEffect: boolean;
  hasFireEffect: boolean;
  hasCosmicEffect: boolean;
  hasAnimatedBorder: boolean;
  borderRotationSpeed: number;
  hoverScale: number;
}

export const rarityConfig: Record<RarityLevel, RarityConfig> = {
  common: {
    label: "Comum",
    icon: "⚙️",
    glowBase: "none",
    glowHover: "none",
    glowExpanded: "none",
    cardBg: "linear-gradient(135deg, rgba(24,24,27,0.9), rgba(39,39,42,0.85))",
    borderGradient: "",
    staticBorderColor: "rgba(113, 113, 122, 0.4)",
    textColor: "text-zinc-400",
    badgeGradient: "linear-gradient(90deg, #52525b, #71717a)",
    animationIntensity: "none",
    hasParticles: false,
    particleCount: 0,
    particleColors: [],
    hasElectricEffect: false,
    hasFireEffect: false,
    hasCosmicEffect: false,
    hasAnimatedBorder: false,
    borderRotationSpeed: 0,
    hoverScale: 1.0,
  },

  medium: {
    label: "Médio",
    icon: "🔷",
    glowBase: "0 0 12px rgba(99, 102, 241, 0.1)",
    glowHover: "0 0 22px rgba(99, 102, 241, 0.28)",
    glowExpanded: "0 0 28px rgba(99, 102, 241, 0.35)",
    cardBg: "linear-gradient(135deg, rgba(30,27,75,0.5), rgba(17,24,39,0.8))",
    borderGradient: "",
    staticBorderColor: "rgba(99, 102, 241, 0.35)",
    textColor: "text-indigo-400",
    badgeGradient: "linear-gradient(90deg, #4338ca, #6366f1)",
    animationIntensity: "low",
    hasParticles: false,
    particleCount: 0,
    particleColors: [],
    hasElectricEffect: false,
    hasFireEffect: false,
    hasCosmicEffect: false,
    hasAnimatedBorder: false,
    borderRotationSpeed: 0,
    hoverScale: 1.02,
  },

  rare: {
    label: "Raro",
    icon: "💠",
    glowBase: "0 0 16px rgba(59, 130, 246, 0.22)",
    glowHover: "0 0 34px rgba(59, 130, 246, 0.5), 0 0 10px rgba(34, 211, 238, 0.2)",
    glowExpanded: "0 0 40px rgba(59, 130, 246, 0.55), 0 0 15px rgba(34, 211, 238, 0.3)",
    cardBg: "linear-gradient(135deg, rgba(23,37,84,0.65), rgba(7,89,133,0.35))",
    borderGradient:
      "conic-gradient(from 0deg, #1d4ed8, #0891b2, #22d3ee, #0891b2, #1d4ed8)",
    staticBorderColor: "rgba(96, 165, 250, 0.5)",
    textColor: "text-blue-400",
    badgeGradient: "linear-gradient(90deg, #1d4ed8, #0891b2)",
    animationIntensity: "low",
    hasParticles: true,
    particleCount: 4,
    particleColors: [
      "rgba(96,165,250,0.7)",
      "rgba(34,211,238,0.65)",
      "rgba(147,197,253,0.55)",
    ],
    hasElectricEffect: false,
    hasFireEffect: false,
    hasCosmicEffect: false,
    hasAnimatedBorder: true,
    borderRotationSpeed: 8,
    hoverScale: 1.02,
  },

  "ultra-rare": {
    label: "Ultra Raro",
    icon: "⚡",
    glowBase: "0 0 22px rgba(139, 92, 246, 0.35)",
    glowHover: "0 0 45px rgba(139, 92, 246, 0.6), 0 0 18px rgba(196, 181, 253, 0.3)",
    glowExpanded:
      "0 0 52px rgba(139, 92, 246, 0.65), 0 0 24px rgba(196, 181, 253, 0.4)",
    cardBg: "linear-gradient(135deg, rgba(46,16,101,0.7), rgba(88,28,135,0.45))",
    borderGradient:
      "conic-gradient(from 0deg, #6d28d9, #a855f7, #c4b5fd, #a855f7, #6d28d9)",
    staticBorderColor: "rgba(167, 139, 250, 0.6)",
    textColor: "text-violet-400",
    badgeGradient: "linear-gradient(90deg, #6d28d9, #a855f7)",
    animationIntensity: "medium",
    hasParticles: true,
    particleCount: 5,
    particleColors: [
      "rgba(167,139,250,0.8)",
      "rgba(196,181,253,0.65)",
      "rgba(139,92,246,0.75)",
    ],
    hasElectricEffect: true,
    hasFireEffect: false,
    hasCosmicEffect: false,
    hasAnimatedBorder: true,
    borderRotationSpeed: 5,
    hoverScale: 1.03,
  },

  epic: {
    label: "Épico",
    icon: "🔮",
    glowBase: "0 0 28px rgba(168, 85, 247, 0.45)",
    glowHover: "0 0 56px rgba(168, 85, 247, 0.7), 0 0 22px rgba(236, 72, 153, 0.35)",
    glowExpanded:
      "0 0 64px rgba(168, 85, 247, 0.75), 0 0 28px rgba(236, 72, 153, 0.45)",
    cardBg: "linear-gradient(135deg, rgba(59,7,100,0.75), rgba(131,24,67,0.45))",
    borderGradient:
      "conic-gradient(from 0deg, #9333ea, #ec4899, #a855f7, #f472b6, #9333ea)",
    staticBorderColor: "rgba(192, 132, 252, 0.7)",
    textColor: "text-purple-400",
    badgeGradient: "linear-gradient(90deg, #9333ea, #ec4899)",
    animationIntensity: "medium",
    hasParticles: true,
    particleCount: 7,
    particleColors: [
      "rgba(192,132,252,0.85)",
      "rgba(249,168,212,0.75)",
      "rgba(168,85,247,0.8)",
      "rgba(236,72,153,0.65)",
    ],
    hasElectricEffect: false,
    hasFireEffect: false,
    hasCosmicEffect: false,
    hasAnimatedBorder: true,
    borderRotationSpeed: 4,
    hoverScale: 1.03,
  },

  mythic: {
    label: "Mítico",
    icon: "🔥",
    glowBase:
      "0 0 30px rgba(239, 68, 68, 0.45), 0 0 14px rgba(168, 85, 247, 0.22)",
    glowHover:
      "0 0 60px rgba(239, 68, 68, 0.7), 0 0 32px rgba(168, 85, 247, 0.45)",
    glowExpanded:
      "0 0 70px rgba(239, 68, 68, 0.75), 0 0 40px rgba(168, 85, 247, 0.55)",
    cardBg: "linear-gradient(135deg, rgba(69,10,10,0.8), rgba(59,7,100,0.55))",
    borderGradient:
      "conic-gradient(from 0deg, #dc2626, #9333ea, #f97316, #9333ea, #dc2626)",
    staticBorderColor: "rgba(239, 68, 68, 0.6)",
    textColor: "text-red-400",
    badgeGradient: "linear-gradient(90deg, #dc2626, #9333ea)",
    animationIntensity: "high",
    hasParticles: true,
    particleCount: 10,
    particleColors: [
      "rgba(239,68,68,0.85)",
      "rgba(249,115,22,0.75)",
      "rgba(168,85,247,0.65)",
      "rgba(253,224,71,0.55)",
    ],
    hasElectricEffect: false,
    hasFireEffect: true,
    hasCosmicEffect: false,
    hasAnimatedBorder: true,
    borderRotationSpeed: 3,
    hoverScale: 1.04,
  },

  legendary: {
    label: "Lendário",
    icon: "👑",
    glowBase:
      "0 0 38px rgba(251, 191, 36, 0.55), 0 0 16px rgba(245, 158, 11, 0.3)",
    glowHover:
      "0 0 70px rgba(251, 191, 36, 0.8), 0 0 35px rgba(245, 158, 11, 0.55)",
    glowExpanded:
      "0 0 80px rgba(251, 191, 36, 0.85), 0 0 45px rgba(245, 158, 11, 0.65)",
    cardBg: "linear-gradient(135deg, rgba(66,32,6,0.85), rgba(120,53,15,0.55))",
    borderGradient:
      "conic-gradient(from 0deg, #b45309, #fbbf24, #fde68a, #fbbf24, #b45309)",
    staticBorderColor: "rgba(251, 191, 36, 0.7)",
    textColor: "text-yellow-400",
    badgeGradient: "linear-gradient(90deg, #92400e, #fbbf24, #92400e)",
    animationIntensity: "high",
    hasParticles: true,
    particleCount: 12,
    particleColors: [
      "rgba(251,191,36,0.9)",
      "rgba(245,158,11,0.8)",
      "rgba(253,224,71,0.75)",
      "rgba(255,255,255,0.55)",
    ],
    hasElectricEffect: true,
    hasFireEffect: false,
    hasCosmicEffect: false,
    hasAnimatedBorder: true,
    borderRotationSpeed: 4,
    hoverScale: 1.04,
  },

  celestial: {
    label: "Celestial",
    icon: "🌌",
    glowBase:
      "0 0 48px rgba(167, 139, 250, 0.65), 0 0 28px rgba(59, 130, 246, 0.35), 0 0 12px rgba(236, 72, 153, 0.2)",
    glowHover:
      "0 0 85px rgba(167, 139, 250, 0.85), 0 0 55px rgba(59, 130, 246, 0.55), 0 0 32px rgba(236, 72, 153, 0.45)",
    glowExpanded:
      "0 0 105px rgba(167, 139, 250, 0.9), 0 0 70px rgba(59, 130, 246, 0.65), 0 0 45px rgba(236, 72, 153, 0.55)",
    cardBg:
      "linear-gradient(135deg, rgba(46,16,101,0.9), rgba(23,37,84,0.75), rgba(76,5,55,0.65))",
    borderGradient:
      "conic-gradient(from 0deg, #7c3aed, #3b82f6, #ec4899, #06b6d4, #a855f7, #7c3aed)",
    staticBorderColor: "rgba(196, 181, 253, 0.8)",
    textColor: "text-violet-300",
    badgeGradient:
      "linear-gradient(90deg, #7c3aed, #3b82f6, #ec4899, #7c3aed)",
    animationIntensity: "extreme",
    hasParticles: true,
    particleCount: 15,
    particleColors: [
      "rgba(196,181,253,0.9)",
      "rgba(147,197,253,0.85)",
      "rgba(249,168,212,0.8)",
      "rgba(255,255,255,0.9)",
      "rgba(167,139,250,0.75)",
      "rgba(103,232,249,0.7)",
    ],
    hasElectricEffect: false,
    hasFireEffect: false,
    hasCosmicEffect: true,
    hasAnimatedBorder: true,
    borderRotationSpeed: 3,
    hoverScale: 1.05,
  },
};

export const RARITY_ORDER: RarityLevel[] = [
  "common",
  "medium",
  "rare",
  "ultra-rare",
  "epic",
  "mythic",
  "legendary",
  "celestial",
];

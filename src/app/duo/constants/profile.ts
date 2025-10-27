import { Crown } from "lucide-react";

export const profiles = [
  {
    id: "main",
    name: "VoguePaintball",
    tag: "#VELGE",
    rank: "Emerald III",
    icon: Crown,
    color: "primary",
    level: 142,
    mainRole: "ADC"
  },
]as const;

export const rankNeonColors: Record<string, string> = {
    Iron: "text-neon-iron",
    Bronze: "text-neon-bronze",
    Silver: "text-neon-silver",
    Gold: "text-neon-gold",
    Platinum: "text-neon-platinum",
    Emerald: "text-neon-emerald",
    Diamond: "text-neon-diamond",
    Master: "text-neon-master",
    Grandmaster: "text-neon-grandmaster",
    Challenger: "text-neon-challenger"
};

export const roles = [
  "Top",
  "Jungle",
  "Mid",
  "ADC",
  "Support",
  "Fill"
] as const;
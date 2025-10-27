import { Sword, Shield, Zap, Target, Users } from "lucide-react";

export const roles = [
  {
    id: "top",
    name: "Top Lane",
    icon: Sword,
    description: "Solo tank/fighter",
    color: "secondary"
  },
  {
    id: "jungle",
    name: "Jungle",
    icon: Shield,
    description: "Map control & ganks",
    color: "secondary"
  },
  {
    id: "mid",
    name: "Mid Lane", 
    icon: Zap,
    description: "Magic damage carry",
    color: "secondary"
  },
  {
    id: "adc",
    name: "ADC",
    icon: Target,
    description: "Attack damage carry",
    color: "secondary"
  },
  {
    id: "support",
    name: "Support",
    icon: Users,
    description: "Team utility & vision",
    color: "secondary"
  }
] as const;
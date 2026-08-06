import { Volume2, Volume1, Volume } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PriorityLevel = "high" | "medium" | "low";
export type StatusLevel = "active" | "expired" | "responded" | "pending";

interface quickMessagesHistoryModalPriorityConfigInterface {
  icon: JSX.Element;
  color: string;
  badge: JSX.Element;
}

interface quickMessagesHistoryModalStatusConfigInterface {
  BadgeStatus: JSX.Element;
}

export const quickMessagesHistoryModalPriorityConfig: Record<
  PriorityLevel,
  quickMessagesHistoryModalPriorityConfigInterface
> = {
  high: {
    icon: <Volume2 className="w-4 h-4 text-neon-green" />,
    color: "neon-border-high",
    badge: (
      <Badge
        variant="outline"
        className="border-neon-green/40 bg-neon-green/10 text-neon-green"
      >
        Volume Máximo
      </Badge>
    ),
  },
  medium: {
    icon: <Volume1 className="w-4 h-4 text-neon-blue" />,
    color: "border-2 border-blue-500 shadow-md shadow-blue-500/15 bg-blue-500/5",
    badge: (
      <Badge
        variant="outline"
        className="border-blue-500/50 bg-blue-500/10 text-neon-blue"
      >
        Volume Médio
      </Badge>
    ),
  },
  low: {
    icon: <Volume className="w-4 h-4 text-muted-foreground" />,
    color: "border border-border/30 bg-muted/10",
    badge: (
      <Badge variant="outline" className="border-border/50 text-muted-foreground">
        Volume Baixo
      </Badge>
    ),
  },
};

export const quickMessagesHistoryModalStatusConfig: Record<
  StatusLevel,
  quickMessagesHistoryModalStatusConfigInterface
> = {
  active: {
    BadgeStatus: (
      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
        Ativa
      </Badge>
    ),
  },
  expired: {
    BadgeStatus: (
      <Badge variant="outline" className="opacity-60">
        Exibida
      </Badge>
    ),
  },
  responded: {
    BadgeStatus: (
      <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">
        Respondida
      </Badge>
    ),
  },
  pending: {
    BadgeStatus: (
      <Badge className="bg-muted text-muted-foreground border-border/40">
        Na fila
      </Badge>
    ),
  },
};

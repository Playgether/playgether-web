import { AlertCircle, Star, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PriorityLevel = "high" | "medium" | "low";
export type StatusLevel = "active" | "expired" | "responded";

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
    icon: <AlertCircle className="w-4 h-4" />,
    color: "order-red-500/50 bg-red-500/10",
    badge: (
      <Badge variant="outline" className="border-red-500/50 text-red-500">
        Alta Prioridade
      </Badge>
    ),
  },
  medium: {
    icon: <Star className="w-4 h-4" />,
    color: "border-yellow-500/50 bg-yellow-500/10",
    badge: (
      <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">
        Média Prioridade
      </Badge>
    ),
  },
  low: {
    icon: <Info className="w-4 h-4" />,
    color: "border-blue-500/50 bg-blue-500/10",
    badge: (
      <Badge variant="outline" className="border-blue-500/50 text-blue-500">
        Baixa Prioridade
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
      <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">
        Respondida
      </Badge>
    ),
  },
  responded: {
    BadgeStatus: (
      <Badge variant="outline" className="opacity-60">
        Expirada
      </Badge>
    ),
  },
};

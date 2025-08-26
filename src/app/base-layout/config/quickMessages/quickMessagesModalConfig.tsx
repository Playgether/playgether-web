export type PriorityLevel = "high" | "medium" | "default";

interface quickMessagesHistoryModalPriorityConfigInterface {
  color: string;
}

export const quickMessagesHistoryModalPriorityConfig: Record<
  PriorityLevel,
  quickMessagesHistoryModalPriorityConfigInterface
> = {
  high: {
    color: "border-neon-purple/80 shadow-glow-neon",
  },
  medium: {
    color: "border-neon-blue/60 shadow-glow-primary/30",
  },
  default: {
    color: "border-border",
  },
};

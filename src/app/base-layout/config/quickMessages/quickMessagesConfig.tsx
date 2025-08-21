type PriorityLevel = "high" | "medium" | "low";

export interface PriorityConfig {
  textPriority: string;
  classPriority: string;
}

export const quickMessagesConfig: Record<PriorityLevel, PriorityConfig> = {
  high: {
    textPriority: "text-neon-green",
    classPriority: "neon-border-high",
  },
  medium: {
    textPriority: "text-neon-blue",
    classPriority: "border-2 border-blue-500 shadow-md shadow-blue-500/15",
  },
  low: {
    textPriority: "text-neon-primary",
    classPriority: "border border-border/30",
  },
};

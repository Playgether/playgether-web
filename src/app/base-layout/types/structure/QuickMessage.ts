export interface QuickMessage {
  id: string;
  user: {
    name: string;
    username?: string;
    avatar: string;
  };
  message: string;
  timeRemaining: string;
  priority: "high" | "medium" | "low";
  duration: number; // in seconds
  fullContent?: string;
  status: "active" | "expired" | "responded";
  timestamp: string;
}

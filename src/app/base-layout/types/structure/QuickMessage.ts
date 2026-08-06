import type { StaticImageData } from "next/image";

export interface QuickMessage {
  id: string;
  user: {
    id?: string;
    name: string;
    username?: string;
    avatar: string | StaticImageData;
  };
  message: string;
  timeRemaining: string;
  priority: "high" | "medium" | "low";
  duration: number; // in seconds
  fullContent?: string;
  status: "active" | "expired" | "responded" | "pending";
  timestamp: string;
  expiresAt?: string | null;
}

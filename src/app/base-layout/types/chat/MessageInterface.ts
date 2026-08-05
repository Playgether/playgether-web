import type { SharedCutContent } from "@/lib/sharedContent";

export interface MessageInterface {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  sharedContent?: SharedCutContent;
}

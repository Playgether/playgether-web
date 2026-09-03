import type { SharedCutContent } from "@/lib/sharedContent";

export type MessageDeliveryStatus = "sent" | "delivered" | "read";

export interface MessageInterface {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  sharedContent?: SharedCutContent;
  deliveryStatus?: MessageDeliveryStatus;
}

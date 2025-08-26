import { StaticImageData } from "next/legacy/image";

export interface ConversationInterface {
  id: string;
  name: string;
  avatar: StaticImageData | string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  type: "private" | "clan" | "group";
}

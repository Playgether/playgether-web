export interface ConversationInterface {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  type: "private" | "clan" | "group";
}

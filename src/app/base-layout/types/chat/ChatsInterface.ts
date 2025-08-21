import { ConversationInterface } from "./ConversationInterface";
import React from "react";

export interface ConversationsProps {
  conversations: ConversationInterface[];
  selectedConversation: ConversationInterface | null;
  onSelectConversation: (conversation: ConversationInterface) => void;
  type: "private" | "clan" | "group";
  notFoundMessage: string;
  fallbackAvatar?: React.ReactElement;
}

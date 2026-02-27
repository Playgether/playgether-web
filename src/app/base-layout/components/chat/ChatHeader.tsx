import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { ConversationInterface } from "../../types/chat/ConversationInterface";

export default function ChatHeader({
  selectedConversation,
}: {
  selectedConversation: ConversationInterface | null;
}) {
  // Guard: show a lightweight placeholder when no conversation is selected
  if (!selectedConversation) {
    return (
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-primary text-white">
              ?
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-muted-foreground">
              Select a conversation
            </h3>
            <p className="text-sm text-muted-foreground">
              No conversation selected
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { name, avatar } = selectedConversation;
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <div className="p-4 border-b border-border/50 bg-muted/20">
      <div className="flex items-center space-x-3">
        <Avatar className="w-10 h-10">
          <AvatarImage
            src={typeof avatar === "string" ? avatar : avatar.src}
            alt={name}
          />
          <AvatarFallback className="bg-gradient-primary text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-neon-green">Online</p>
        </div>
      </div>
    </div>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { ConversationInterface } from "../../types/chat/ConversationInterface";

export default function ChatHeader({
  selectedConversation,
  onBack,
}: {
  selectedConversation: ConversationInterface | null;
  onBack?: () => void;
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
    <div className="border-b border-border/50 bg-muted/20 p-3 sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-muted/50 md:hidden"
            aria-label="Voltar para conversas"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
          <AvatarImage
            src={typeof avatar === "string" ? avatar : avatar.src}
            alt={name}
          />
          <AvatarFallback className="bg-gradient-primary text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium sm:text-base">{name}</h3>
          <p className="text-xs text-neon-green sm:text-sm">Online</p>
        </div>
      </div>
    </div>
  );
}

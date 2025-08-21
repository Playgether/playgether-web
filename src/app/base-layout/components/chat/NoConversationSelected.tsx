import { MessageCircle } from "lucide-react";
import React from "react";

export default function NoConversationSelected() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <div className="text-center">
        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg">Selecione uma conversa para começar</p>
      </div>
    </div>
  );
}

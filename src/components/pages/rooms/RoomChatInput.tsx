"use client";

import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { handleKeyDown } from "@/components/layouts/SendOnEnterKey/sendOnEnterKey";
import TextAreaLayout from "@/components/layouts/TextAreaLayout/TextAreaLayout";
import { Send } from "lucide-react";

export default function RoomChatInput() {
  const { sendMessage, setNewMessage, newMessage } = useChatHandlerContext();

  return (
    <div className="relative z-10 flex shrink-0 items-center gap-2 border-t border-border bg-card p-3">
      <div className="flex-1 rounded-full border border-border/80 bg-muted px-2">
        <TextAreaLayout
          register={null}
          placeholder="Digite uma mensagem..."
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          maxRows={6}
          minRows={1}
          className="w-full"
          textAreaClassName="resize-none border-none bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none"
          onKeyDown={(event) => handleKeyDown(event, sendMessage)}
        />
      </div>
      <button
        type="button"
        onClick={sendMessage}
        disabled={!newMessage.trim()}
        className="rounded-full bg-primary p-2.5 text-white transition-all hover:scale-105 hover:brightness-110 active:scale-95 disabled:opacity-25 disabled:hover:scale-100"
        aria-label="Enviar mensagem"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}

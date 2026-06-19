"use client";

import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { handleKeyDown } from "@/components/layouts/SendOnEnterKey/sendOnEnterKey";
import TextAreaLayout from "@/components/layouts/TextAreaLayout/TextAreaLayout";
import { Send } from "lucide-react";

export default function RoomChatInput() {
  const { sendMessage, setNewMessage, newMessage } = useChatHandlerContext();
  const { muteNotice } = useRoomPermissions();

  const disabled = Boolean(muteNotice);

  return (
    <div className="relative z-10 flex shrink-0 items-center gap-2 border-t border-border bg-card p-3">
      <div className="flex-1 rounded-full border border-border/80 bg-muted px-2">
    <div className="flex shrink-0 flex-col gap-2 border-t border-border/60 bg-card/90 p-3 backdrop-blur-md">
      {muteNotice ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs font-semibold text-amber-800 dark:text-amber-200">
          {muteNotice}
        </p>
      ) : null}
      <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full border border-border bg-muted/80 px-2">
        <TextAreaLayout
          register={null}
          placeholder={
            disabled ? "Você não pode enviar mensagens agora." : "Digite uma mensagem..."
          }
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
        disabled={!newMessage.trim() || disabled}
        className="rounded-full gradient-primary p-2.5 text-primary-foreground transition-all hover:scale-105 hover:shadow-glow-primary active:scale-95 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:shadow-none"
        aria-label="Enviar mensagem"
      >
        <Send className="h-4 w-4" />
      </button>
      </div>
    </div>
  );
}

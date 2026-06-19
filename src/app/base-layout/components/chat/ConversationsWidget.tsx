"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { ConversationsContent } from "./ConversationsContent";
import { useDMUnread } from "@/context/DMUnreadContext";
import { useConversationsWidget } from "@/context/ConversationsWidgetContext";

export function ConversationsWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [forceSelectId, setForceSelectId] = useState<string | undefined>(undefined);
  const { unreadCount } = useDMUnread();
  const { pendingConvId, clearPending } = useConversationsWidget();

  // Open widget and select conversation when triggered externally (e.g. "Mensagem" button on profile)
  useEffect(() => {
    if (!pendingConvId) return;
    setOpen(true);
    setForceSelectId(pendingConvId);
    clearPending();
  }, [pendingConvId, clearPending]);

  // Não mostrar na página de conversas
  if (pathname === "/conversations") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Painel */}
      {open && (
        <div className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl w-[720px] h-[480px] overflow-hidden">
          {/* Header do widget */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-border/50 flex-shrink-0">
            <span className="font-semibold text-sm">Conversas</span>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="h-[calc(480px-48px)]">
            <ConversationsContent
              listHeight="calc(480px - 168px)"
              chatHeight="flex-1"
              forceSelectId={forceSelectId}
            />
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-gradient-primary shadow-lg hover:shadow-glow-neon hover:scale-105 transition-all duration-300 flex items-center justify-center relative"
        aria-label="Abrir conversas"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-secondary rounded-full text-xs font-bold text-white flex items-center justify-center animate-glow-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

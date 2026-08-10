"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { ConversationsContent } from "./ConversationsContent";
import { useDMUnread } from "@/context/DMUnreadContext";
import {
  useConversationsWidget,
  type MegaphoneReplyDraft,
} from "@/context/ConversationsWidgetContext";

export function ConversationsWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [forceSelectId, setForceSelectId] = useState<string | undefined>(
    undefined
  );
  const [forceDraft, setForceDraft] = useState<string | undefined>(undefined);
  const [forceMegaphoneReply, setForceMegaphoneReply] = useState<
    MegaphoneReplyDraft | undefined
  >(undefined);
  const { unreadCount } = useDMUnread();
  const {
    pendingConvId,
    pendingDraft,
    pendingMegaphoneReply,
    clearPending,
  } = useConversationsWidget();

  useEffect(() => {
    if (!pendingConvId) return;
    setOpen(true);
    setForceSelectId(pendingConvId);
    setForceDraft(pendingDraft ?? undefined);
    setForceMegaphoneReply(pendingMegaphoneReply ?? undefined);
    clearPending();
  }, [pendingConvId, pendingDraft, pendingMegaphoneReply, clearPending]);

  if (pathname === "/conversations") return null;

  return (
    <div className="fixed bottom-[calc(var(--layout-quick-messages-height)+0.75rem)] right-3 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[min(70dvh,480px)] w-[min(calc(100vw-1.5rem),720px)] flex-col overflow-hidden rounded-2xl border border-primary/20 bg-background/95 shadow-2xl backdrop-blur-xl sm:h-[480px] sm:w-[min(calc(100vw-3rem),560px)] lg:w-[720px]">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/50 px-4">
            <span className="text-sm font-semibold">Conversas</span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-muted/50"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <ConversationsContent
              listHeight="calc(100% - 120px)"
              chatHeight="flex-1"
              forceSelectId={forceSelectId}
              forceDraft={forceDraft}
              forceMegaphoneReply={forceMegaphoneReply}
            />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-glow-neon sm:h-14 sm:w-14"
        aria-label="Abrir conversas"
      >
        <MessageSquare className="h-5 w-5 text-white sm:h-6 sm:w-6" />
        {/* Badge some enquanto o modal está aberto */}
        {!open && unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 animate-glow-pulse items-center justify-center rounded-full bg-gradient-secondary text-[10px] font-bold text-white sm:h-5 sm:w-5 sm:text-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>
    </div>
  );
}

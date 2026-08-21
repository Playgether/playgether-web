"use client";

import { useEffect } from "react";
import { useConversationsWidget } from "@/context/ConversationsWidgetContext";
import {
  DUO_OPEN_CHAT_EVENT,
  type DuoOpenChatDetail,
} from "@/lib/duoInviteEvents";
import { startConversation } from "@/services/directMessages";
import { CustomToast } from "@/components/ui/customSonner";

/**
 * Lives under ConversationsWidgetProvider so toast "Enviar mensagem"
 * can open the duo chat from NotificationsContext (outside this tree).
 */
export function DuoInviteToastBridge() {
  const { openWithConversation } = useConversationsWidget();

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<DuoOpenChatDetail>).detail;
      if (!detail?.partnerUserId) return;

      void (async () => {
        const duoReply =
          detail.partnerUsername || detail.partnerName
            ? {
                gameName: "Duo",
                matchPercent: 0,
                partnerUsername: detail.partnerUsername || "",
                partnerName: detail.partnerName || detail.partnerUsername || "",
                partnerAvatar: detail.partnerAvatar ?? undefined,
              }
            : undefined;

        if (detail.conversationId) {
          openWithConversation(detail.conversationId, {
            duoReply,
          });
          return;
        }

        const result = await startConversation(String(detail.partnerUserId), {
          source: "duo",
        });
        if (!result.ok) {
          CustomToast.error(result.error || "Não foi possível abrir o chat.");
          return;
        }
        openWithConversation(result.conversation.id, { duoReply });
      })();
    };

    window.addEventListener(DUO_OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(DUO_OPEN_CHAT_EVENT, onOpen);
  }, [openWithConversation]);

  return null;
}

"use client";

import { useCallback } from "react";
import { useSecureWebSocket } from "./useSecureWebSocket";
import type { DMMessage } from "@/services/directMessages";

export type DMConversationStatusEvent = {
  type: "request_accepted";
  conversation_id: string;
  status: "active" | "pending";
  is_incoming_request?: boolean;
};

interface UseDMWebSocketOptions {
  conversationId: string | null;
  onNewMessage?: (message: DMMessage) => void;
  onStatusEvent?: (event: DMConversationStatusEvent) => void;
}

export function useDMWebSocket({
  conversationId,
  onNewMessage,
  onStatusEvent,
}: UseDMWebSocketOptions) {
  const { sendMessage, isConnected } = useSecureWebSocket({
    url: conversationId ? `/ws/dm/${conversationId}/` : "",
    onMessage: (data) => {
      if (data.type === "new_message") {
        onNewMessage?.(data as DMMessage);
        return;
      }
      if (data.type === "request_accepted") {
        onStatusEvent?.(data as DMConversationStatusEvent);
      }
    },
  });

  const sendEncryptedMessage = useCallback(
    (payload: {
      encrypted_body: string;
      encrypted_key_recipient: string;
      encrypted_key_sender: string;
      iv: string;
    }) => {
      if (!isConnected || !conversationId) return;
      sendMessage(JSON.stringify({ type: "send_message", ...payload }));
    },
    [sendMessage, isConnected, conversationId]
  );

  const sendGroupMessage = useCallback(
    (body: string) => {
      if (!isConnected || !conversationId) return;
      sendMessage(JSON.stringify({ type: "send_message", body }));
    },
    [sendMessage, isConnected, conversationId]
  );

  const markRead = useCallback(() => {
    if (!isConnected || !conversationId) return;
    sendMessage(JSON.stringify({ type: "mark_read" }));
  }, [sendMessage, isConnected, conversationId]);

  return { sendEncryptedMessage, sendGroupMessage, markRead, isConnected };
}

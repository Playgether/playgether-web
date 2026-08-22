"use client";

import { useCallback } from "react";
import { useSecureWebSocket } from "./useSecureWebSocket";
import type { DMMessage } from "@/services/directMessages";

export type DMConversationStatusEvent = {
  type: "request_accepted" | "user_blocked" | "user_unblocked";
  conversation_id: string;
  status?: "active" | "pending";
  is_incoming_request?: boolean;
  can_message?: boolean;
  can_message_reason?: string | null;
  other_participant_profile_photo?: string | null;
  can_view_profile?: boolean;
};

export type DMMessageStatusEvent = {
  type: "message_status";
  message_id: string;
  delivered_at?: string;
  is_read?: boolean;
};

interface UseDMWebSocketOptions {
  conversationId: string | null;
  onNewMessage?: (message: DMMessage) => void;
  onStatusEvent?: (event: DMConversationStatusEvent) => void;
  onMessageStatus?: (event: DMMessageStatusEvent) => void;
}

export function useDMWebSocket({
  conversationId,
  onNewMessage,
  onStatusEvent,
  onMessageStatus,
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
        return;
      }
      if (data.type === "user_blocked") {
        onStatusEvent?.(data as DMConversationStatusEvent);
        return;
      }
      if (data.type === "user_unblocked") {
        onStatusEvent?.(data as DMConversationStatusEvent);
        return;
      }
      if (data.type === "message_status") {
        onMessageStatus?.(data as DMMessageStatusEvent);
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
    [sendMessage, isConnected, conversationId],
  );

  const sendGroupMessage = useCallback(
    (body: string) => {
      if (!isConnected || !conversationId) return;
      sendMessage(JSON.stringify({ type: "send_message", body }));
    },
    [sendMessage, isConnected, conversationId],
  );

  const markRead = useCallback(() => {
    if (!isConnected || !conversationId) return;
    sendMessage(JSON.stringify({ type: "mark_read" }));
  }, [sendMessage, isConnected, conversationId]);

  const markDelivered = useCallback(
    (messageIds: string[]) => {
      if (!isConnected || !conversationId || messageIds.length === 0) return;
      sendMessage(
        JSON.stringify({ type: "mark_delivered", message_ids: messageIds }),
      );
    },
    [sendMessage, isConnected, conversationId],
  );

  return {
    sendEncryptedMessage,
    sendGroupMessage,
    markRead,
    markDelivered,
    isConnected,
  };
}

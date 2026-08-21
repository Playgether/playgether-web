"use client";

import { useCallback } from "react";
import { useSecureWebSocket } from "./useSecureWebSocket";
import type { DMConversationStatusEvent } from "./useDMWebSocket";

interface UseDMNotificationsOptions {
  onNotification: (conversationId: string, senderId: string) => void;
  onStatusEvent?: (event: DMConversationStatusEvent) => void;
}

export function useDMNotifications({
  onNotification,
  onStatusEvent,
}: UseDMNotificationsOptions) {
  const handleMessage = useCallback(
    (data: {
      type?: string;
      conversation_id?: string;
      sender_id?: string;
      status?: "active" | "pending";
      is_incoming_request?: boolean;
    }) => {
      if (data.type === "request_accepted" && data.conversation_id) {
        onStatusEvent?.({
          type: "request_accepted",
          conversation_id: data.conversation_id,
          status: data.status ?? "active",
          is_incoming_request: data.is_incoming_request ?? false,
        });
        return;
      }
      if (data.conversation_id) {
        onNotification(data.conversation_id, data.sender_id ?? "");
      }
    },
    [onNotification, onStatusEvent]
  );

  useSecureWebSocket({
    url: "/ws/dm/notifications/",
    onMessage: handleMessage,
  });
}

"use client";

import { useCallback } from "react";
import { useSecureWebSocket } from "./useSecureWebSocket";

interface UseDMNotificationsOptions {
  onNotification: (conversationId: string, senderId: string) => void;
}

export function useDMNotifications({ onNotification }: UseDMNotificationsOptions) {
  const handleMessage = useCallback(
    (data: { conversation_id?: string; sender_id?: string }) => {
      if (data.conversation_id) {
        onNotification(data.conversation_id, data.sender_id ?? "");
      }
    },
    [onNotification]
  );

  useSecureWebSocket({
    url: "/ws/dm/notifications/",
    onMessage: handleMessage,
  });
}

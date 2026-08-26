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
      can_message?: boolean;
      can_message_reason?: string | null;
      other_participant_profile_photo?: string | null;
      can_view_profile?: boolean;
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
      if (data.type === "user_blocked" && data.conversation_id) {
        onStatusEvent?.({
          type: "user_blocked",
          conversation_id: data.conversation_id,
          can_message: data.can_message ?? false,
          can_message_reason: data.can_message_reason ?? null,
        });
        return;
      }
      if (data.type === "user_unblocked" && data.conversation_id) {
        onStatusEvent?.({
          type: "user_unblocked",
          conversation_id: data.conversation_id,
          can_message: data.can_message ?? true,
          can_message_reason: data.can_message_reason ?? null,
          other_participant_profile_photo:
            data.other_participant_profile_photo ?? null,
          can_view_profile: data.can_view_profile ?? true,
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

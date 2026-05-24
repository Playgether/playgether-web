"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSecureWebSocket } from "./useSecureWebSocket";
import type { DMMessage } from "@/services/directMessages";

interface UseDMWebSocketOptions {
  conversationId: string | null;
  onNewMessage?: (message: DMMessage) => void;
}

export function useDMWebSocket({ conversationId, onNewMessage }: UseDMWebSocketOptions) {
  const { sendMessage, isConnected } = useSecureWebSocket({
    url: conversationId ? `/ws/dm/${conversationId}/` : "",
    onMessage: (data) => {
      if (data.type === "new_message") {
        onNewMessage?.(data as DMMessage);
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
      sendMessage(
        JSON.stringify({
          type: "send_message",
          ...payload,
        })
      );
    },
    [sendMessage, isConnected, conversationId]
  );

  const markRead = useCallback(() => {
    if (!isConnected || !conversationId) return;
    sendMessage(JSON.stringify({ type: "mark_read" }));
  }, [sendMessage, isConnected, conversationId]);

  return { sendEncryptedMessage, markRead, isConnected };
}

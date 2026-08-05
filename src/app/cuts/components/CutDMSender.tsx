"use client";

import { useEffect, useRef } from "react";
import { useDMWebSocket } from "@/hooks/useDMWebSocket";

export interface EncryptedDMPayload {
  encrypted_body: string;
  encrypted_key_recipient: string;
  encrypted_key_sender: string;
  iv: string;
}

interface CutDMSenderProps {
  conversationId: string;
  payload: EncryptedDMPayload;
  onDone: (ok: boolean) => void;
}

/** Componente efêmero: conecta no WS de uma conversa, envia uma mensagem cifrada e avisa o pai. */
export function CutDMSender({ conversationId, payload, onDone }: CutDMSenderProps) {
  const sentRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const { sendEncryptedMessage, isConnected } = useDMWebSocket({ conversationId });

  useEffect(() => {
    if (!isConnected || sentRef.current) return;
    sentRef.current = true;
    sendEncryptedMessage(payload);
    const t = setTimeout(() => onDoneRef.current(true), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!sentRef.current) onDoneRef.current(false);
    }, 8000);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}

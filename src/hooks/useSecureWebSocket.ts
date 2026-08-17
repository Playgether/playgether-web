"use client";

import { useCallback, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  buildAuthenticatedWebSocketUrl,
  requestWebSocketTicket,
} from "@/lib/websocketAuth";

interface UseSecureWebSocketOptions {
  url: string;
  shouldReconnect?: (closeEvent: CloseEvent) => boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onMessage?: (message: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useSecureWebSocket = (options: UseSecureWebSocketOptions) => {
  const {
    url,
    shouldReconnect = () => true,
    reconnectAttempts = 10,
    reconnectInterval = 3000,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = options;

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const getSocketUrl = useCallback(async (): Promise<string> => {
    if (!url) throw new Error("WebSocket path is required.");

    try {
      const { ticket } = await requestWebSocketTicket(url);
      setIsAuthorized(true);
      setConnectionError(null);
      return buildAuthenticatedWebSocketUrl(url, ticket);
    } catch {
      setIsAuthorized(false);
      setConnectionError("Erro ao verificar autorização");
      throw new Error("WebSocket authorization failed.");
    }
  }, [url]);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    getSocketUrl,
    {
      shouldReconnect,
      reconnectAttempts,
      reconnectInterval,
      retryOnError: true,
      onOpen: () => {
        setConnectionError(null);
        onOpen?.();
      },
      onClose: (event) => {
        onClose?.();
      },
      onError: (event) => {
        setConnectionError("Erro na conexão WebSocket");
        onError?.(event);
      },
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error("Erro ao processar mensagem WebSocket:", error);
        }
      },
    },
    Boolean(url),
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Conectando",
    [ReadyState.OPEN]: "Conectado",
    [ReadyState.CLOSING]: "Fechando",
    [ReadyState.CLOSED]: "Fechado",
    [ReadyState.UNINSTANTIATED]: "Não instanciado",
  }[readyState];

  const reconnect = useCallback(() => {
    getWebSocket()?.close();
  }, [getWebSocket]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    connectionStatus,
    isAuthorized,
    connectionError,
    reconnect,
    isConnected: readyState === ReadyState.OPEN,
  };
};

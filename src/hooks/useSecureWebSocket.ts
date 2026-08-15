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
  const [wsTicket, setWsTicket] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [wsBaseUrl, setWsBaseUrl] = useState<string | null>(null);
  const reconnectCountRef = useRef(0);

  // 1. ✅ Função para construir a URL do WebSocket
  const getWebSocketBaseUrl = useCallback((): string | null => {
    // Prioridade: variável de ambiente definida explicitamente
    if (process.env.NEXT_PUBLIC_WS_URL) {
      return process.env.NEXT_PUBLIC_WS_URL;
    }

    // Fallback: construção dinâmica (apenas no cliente)
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.hostname;
      const port = process.env.NEXT_PUBLIC_WS_PORT || "8000";
      return `${protocol}://${host}:${port}`;
    }

    return null;
  }, []);

  // 2. ✅ Troca o access token por um ticket opaco de uso único (TTL 120s)
  const checkAuthorization = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/ws/authorize", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(data.authorized);
        setWsTicket(data.ticket ?? null);

        if (!data.authorized) {
          setConnectionError(data.error || "Não autorizado");
        }

        return data.authorized;
      } else {
        setConnectionError("Erro na autorização");
        return false;
      }
    } catch {

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

  // 3. ✅ URL completa do WebSocket (ticket opaco — JWT não vai na URL)
  const fullWsUrl =
    wsBaseUrl && isAuthorized && wsTicket && url
      ? `${wsBaseUrl}${url}${url.includes("?") ? "&" : "?"}ticket=${encodeURIComponent(wsTicket)}`
      : null;

  // 4. ✅ Hook useWebSocket
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

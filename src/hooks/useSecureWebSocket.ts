"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

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

  // 2. ✅ Função de autorização
  const checkAuthorization = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/ws/authorize", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(data.authorized);

        if (!data.authorized) {
          setConnectionError(data.error || "Não autorizado");
        }

        return data.authorized;
      } else {
        setConnectionError("Erro na autorização");
        return false;
      }
    } catch (error) {
      setConnectionError("Erro ao verificar autorização");
      return false;
    }
  }, []);

  // 3. ✅ URL completa do WebSocket
  const fullWsUrl = wsBaseUrl && isAuthorized ? `${wsBaseUrl}${url}` : null;

  // 4. ✅ Hook useWebSocket
  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    fullWsUrl,
    {
      shouldReconnect: (closeEvent) => {
        if (reconnectCountRef.current >= reconnectAttempts) {
          return false;
        }
        reconnectCountRef.current++;
        return shouldReconnect(closeEvent);
      },
      reconnectAttempts,
      reconnectInterval,
      onOpen: (event) => {
        reconnectCountRef.current = 0;
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
    }
  );

  // 5. ✅ Efeitos para inicialização
  useEffect(() => {
    // Configura a URL base do WebSocket
    const baseUrl = getWebSocketBaseUrl();
    if (baseUrl) {
      setWsBaseUrl(baseUrl);
    }
  }, [getWebSocketBaseUrl]);

  useEffect(() => {
    // Verifica autorização após a URL base estar configurada
    if (wsBaseUrl) {
      checkAuthorization();
    }
  }, [wsBaseUrl, checkAuthorization]);

  // 6. ✅ Status da conexão
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Conectando",
    [ReadyState.OPEN]: "Conectado",
    [ReadyState.CLOSING]: "Fechando",
    [ReadyState.CLOSED]: "Fechado",
    [ReadyState.UNINSTANTIATED]: "Não instanciado",
  }[readyState];

  // 7. ✅ Função de reconexão
  const reconnect = useCallback(() => {
    reconnectCountRef.current = 0;
    checkAuthorization().then((authorized) => {
      if (authorized && getWebSocket()) {
        getWebSocket()?.close();
      }
    });
  }, [checkAuthorization, getWebSocket]);

  // 8. ✅ Retorno do hook
  return {
    sendMessage,
    lastMessage,
    readyState,
    connectionStatus,
    isAuthorized,
    connectionError,
    reconnect,
    isConnected: readyState === ReadyState.OPEN,
    wsUrl: fullWsUrl, // Para debugging
  };
};

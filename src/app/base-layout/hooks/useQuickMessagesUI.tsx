// hooks/useQuickMessagesUI.ts - VERSÃO OTIMIZADA
"use client";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { QuickMessage } from "../types/structure/QuickMessage";
import { useQuickMessages } from "./useQuickMessages";
import {
  needsAnimation,
  calculateAnimationDuration,
} from "../utils/quickMessagesUtils";

interface UIState {
  historyOpen: boolean;
  messageModalOpen: boolean;
  selectedMessage: QuickMessage | null;
}

const HISTORY_LIMIT = 50;

export const useQuickMessagesUI = (quickMessages: QuickMessage[]) => {
  // Estado das mensagens gerenciado pelo hook otimizado
  const { activeMessages, messageTimers, allMessagesShown, fadingOutMessages } =
    useQuickMessages(quickMessages);

  // ✅ Estado consolidado da UI
  const [uiState, setUIState] = useState<UIState>({
    historyOpen: false,
    messageModalOpen: false,
    selectedMessage: null,
  });

  // Histórico das ultimas mensagens mostradas
  const [historyMessages, setHistoryMessages] = useState<QuickMessage[]>([]);

  // Referências para os elementos das mensagens
  const messageRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>(
    {}
  );

  // Atualiza histórico sempre que uma mensagem é exibida
  const handleMessageShown = useCallback((message: QuickMessage) => {
    setHistoryMessages((prev) => {
      if (prev.find((m) => m.id === message.id)) return prev;
      return [message, ...prev].slice(0, HISTORY_LIMIT);
    });
  }, []);

  // ✅ Callbacks memoizados para evitar re-renders
  const setHistoryOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({ ...prev, historyOpen: open }));
  }, []);

  const setMessageModalOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({ ...prev, messageModalOpen: open }));
  }, []);

  const setSelectedMessage = useCallback((message: QuickMessage | null) => {
    setUIState((prev) => ({ ...prev, selectedMessage: message }));
  }, []);

  // ✅ Handler otimizado para clique em mensagem
  const handleMessageClick = useCallback(
    (message: QuickMessage) => {
      setUIState((prev) => ({
        ...prev,
        selectedMessage: message,
        messageModalOpen: true,
      }));
      handleMessageShown(message);
    },
    [handleMessageShown]
  );

  // ✅ Handler para clique no histórico
  const handleHistoryMessageClick = useCallback((message: QuickMessage) => {
    setUIState({
      historyOpen: false,
      messageModalOpen: true,
      selectedMessage: message,
    });
  }, []);

  // Atualiza histórico quando mensagens ativas mudam
  useEffect(() => {
    activeMessages.forEach((msg) => {
      handleMessageShown(msg);
    });
  }, [activeMessages, handleMessageShown]);

  // ✅ Dados de animação memoizados para melhor performance
  const animationData = useMemo(() => {
    const data: Record<string, { shouldAnimate: boolean; duration: number }> =
      {};

    activeMessages.forEach((message) => {
      const el = messageRefs.current[message.id];
      data[message.id] = {
        shouldAnimate: needsAnimation(el),
        duration: calculateAnimationDuration(el),
      };
    });

    return data;
  }, [activeMessages]); // Recalcular apenas quando mensagens mudarem

  // ✅ Função para obter dados de animação sem re-calcular
  const getAnimationData = useCallback(
    (messageId: string) => {
      return animationData[messageId] || { shouldAnimate: false, duration: 0 };
    },
    [animationData]
  );

  // ✅ Retorno memoizado
  return useMemo(
    () => ({
      // Estado das mensagens
      activeMessages,
      messageTimers,
      allMessagesShown,
      fadingOutMessages,

      // Estado da UI
      historyOpen: uiState.historyOpen,
      messageModalOpen: uiState.messageModalOpen,
      selectedMessage: uiState.selectedMessage,

      // Refs e funções
      messageRefs,

      // Histórico dinâmico
      historyMessages,

      // Handlers otimizados
      setHistoryOpen,
      setMessageModalOpen,
      setSelectedMessage,
      handleMessageClick,
      handleHistoryMessageClick,

      // Dados de animação otimizados
      getAnimationData,
    }),
    [
      activeMessages,
      messageTimers,
      allMessagesShown,
      fadingOutMessages,
      uiState,
      setHistoryOpen,
      historyMessages,
      setMessageModalOpen,
      setSelectedMessage,
      handleMessageClick,
      handleHistoryMessageClick,
      getAnimationData,
    ]
  );
};

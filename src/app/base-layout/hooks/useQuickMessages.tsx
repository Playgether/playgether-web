// hooks/useQuickMessages.ts - VERSÃO OTIMIZADA
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { QuickMessage } from "../types/structure/QuickMessage";

interface QuickMessagesState {
  activeMessages: QuickMessage[];
  messageTimers: Record<string, number>;
  allMessagesShown: boolean;
  fadingOutMessages: Set<string>;
}

export const useQuickMessages = (messages: QuickMessage[]) => {
  // ✅ Estado consolidado para evitar race conditions
  const [state, setState] = useState<QuickMessagesState>({
    activeMessages: [],
    messageTimers: {},
    allMessagesShown: false,
    fadingOutMessages: new Set(),
  });

  // Refs para controle interno
  const shownMessageIds = useRef<Set<string>>(new Set());
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const intervalRef = useRef<NodeJS.Timeout>();
  const isInitialized = useRef(false);

  // ✅ Função para limpar timeouts com segurança
  const cleanupTimeouts = useCallback((messageIds?: string[]) => {
    if (messageIds) {
      messageIds.forEach((id) => {
        if (timeoutRefs.current[id]) {
          clearTimeout(timeoutRefs.current[id]);
          delete timeoutRefs.current[id];
        }
      });
    } else {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
      timeoutRefs.current = {};
    }
  }, []);

  // ✅ Cleanup completo no unmount
  useEffect(() => {
    return () => {
      cleanupTimeouts();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cleanupTimeouts]);

  // ✅ Função memoizada para encontrar próxima mensagem
  const findNextUnshownMessage = useCallback(() => {
    return messages.find((m) => !shownMessageIds.current.has(m.id));
  }, [messages]);

  // ✅ Handler otimizado para fim de timer
  const handleMessageTimerEnd = useCallback(
    (messageId: string) => {
      // Iniciar fade out
      setState((prev) => ({
        ...prev,
        fadingOutMessages: new Set(prev.fadingOutMessages).add(messageId),
      }));

      cleanupTimeouts([messageId]);

      // Timeout para remover mensagem após animação
      timeoutRefs.current[messageId] = setTimeout(() => {
        setState((currentState) => {
          const nextUnshown = findNextUnshownMessage();
          shownMessageIds.current.add(messageId);

          // ✅ Atualização atômica do estado
          const newState: QuickMessagesState = {
            activeMessages: nextUnshown
              ? currentState.activeMessages.map((msg) =>
                  msg.id === messageId ? nextUnshown : msg
                )
              : currentState.activeMessages.filter(
                  (msg) => msg.id !== messageId
                ),

            messageTimers: nextUnshown
              ? {
                  ...currentState.messageTimers,
                  [nextUnshown.id]: nextUnshown.duration,
                }
              : currentState.messageTimers,

            allMessagesShown:
              messages.length > 0 &&
              shownMessageIds.current.size >= messages.length,

            fadingOutMessages: (() => {
              const newSet = new Set(currentState.fadingOutMessages);
              newSet.delete(messageId);
              return newSet;
            })(),
          };

          if (nextUnshown) {
            shownMessageIds.current.add(nextUnshown.id);
          }

          return newState;
        });

        delete timeoutRefs.current[messageId];
      }, 300);
    },
    [messages, findNextUnshownMessage, cleanupTimeouts]
  );

  // ✅ Inicialização otimizada e limpeza de mensagens removidas
  useEffect(() => {
    // Limpa timeouts e refs de mensagens removidas
    const currentIds = new Set(messages.map((m) => m.id));
    const removedIds = Array.from(shownMessageIds.current).filter(
      (id) => !currentIds.has(id)
    );
    if (removedIds.length) {
      removedIds.forEach((id) => shownMessageIds.current.delete(id));
      cleanupTimeouts(removedIds);
    }

    // Inicialização padrão
    if (isInitialized.current || messages.length === 0) return;

    const initialMessages = messages.slice(0, 3);
    const initialTimers: Record<string, number> = {};

    initialMessages.forEach((msg) => {
      initialTimers[msg.id] = msg.duration;
      shownMessageIds.current.add(msg.id);
    });

    setState({
      activeMessages: initialMessages,
      messageTimers: initialTimers,
      allMessagesShown: messages.length <= 3,
      fadingOutMessages: new Set(),
    });

    isInitialized.current = true;
  }, [messages, cleanupTimeouts]);

  // ✅ Timer otimizado com menor overhead
  useEffect(() => {
    if (state.activeMessages.length === 0) return;

    intervalRef.current = setInterval(() => {
      setState((currentState) => {
        const newTimers = { ...currentState.messageTimers };
        let hasChanges = false;

        // ✅ Processar apenas mensagens ativas
        currentState.activeMessages.forEach((message) => {
          if (newTimers[message.id] > 0) {
            newTimers[message.id]--;
            hasChanges = true;

            // ✅ Agendar fim do timer sem bloquear
            if (newTimers[message.id] === 0) {
              // Usar setTimeout para não bloquear o estado atual
              setTimeout(() => handleMessageTimerEnd(message.id), 0);
            }
          }
        });

        return hasChanges
          ? { ...currentState, messageTimers: newTimers }
          : currentState;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.activeMessages, handleMessageTimerEnd]);

  // ✅ Retorno memoizado para evitar re-renders desnecessários
  return useMemo(
    () => ({
      activeMessages: state.activeMessages,
      messageTimers: state.messageTimers,
      allMessagesShown: state.allMessagesShown,
      fadingOutMessages: state.fadingOutMessages,
    }),
    [state]
  );
};

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { QuickMessage } from "../types/structure/QuickMessage";

interface QuickMessagesState {
  activeMessages: QuickMessage[];
  messageTimers: Record<string, number>;
  allMessagesShown: boolean;
  fadingOutMessages: Set<string>;
}

interface UseQuickMessagesOptions {
  /** Quantas mensagens exibir ao mesmo tempo (PC: 3, mobile: 1). */
  maxConcurrent?: number;
}

export const useQuickMessages = (
  messages: QuickMessage[],
  options: UseQuickMessagesOptions = {}
) => {
  const maxConcurrent = Math.max(
    1,
    Math.min(3, options.maxConcurrent ?? 3)
  );

  const [state, setState] = useState<QuickMessagesState>({
    activeMessages: [],
    messageTimers: {},
    allMessagesShown: false,
    fadingOutMessages: new Set(),
  });

  const shownMessageIds = useRef<Set<string>>(new Set());
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});
  const intervalRef = useRef<NodeJS.Timeout>();
  const isInitialized = useRef(false);
  const prevMaxConcurrent = useRef(maxConcurrent);

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

  const findNextUnshownMessage = useCallback(() => {
    return messages.find((m) => !shownMessageIds.current.has(m.id));
  }, [messages]);

  const resetQueue = useCallback(() => {
    isInitialized.current = false;
    shownMessageIds.current = new Set();
    cleanupTimeouts();
    setState({
      activeMessages: [],
      messageTimers: {},
      allMessagesShown: false,
      fadingOutMessages: new Set(),
    });
  }, [cleanupTimeouts]);

  const initialize = useCallback(() => {
    if (messages.length === 0) return;

    const initialMessages = messages.slice(0, maxConcurrent);
    const initialTimers: Record<string, number> = {};

    shownMessageIds.current = new Set();
    initialMessages.forEach((msg) => {
      initialTimers[msg.id] = msg.duration;
      shownMessageIds.current.add(msg.id);
    });

    setState({
      activeMessages: initialMessages,
      messageTimers: initialTimers,
      allMessagesShown: messages.length <= maxConcurrent,
      fadingOutMessages: new Set(),
    });

    isInitialized.current = true;
  }, [messages, maxConcurrent]);

  useEffect(() => {
    return () => {
      cleanupTimeouts();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cleanupTimeouts]);

  const handleMessageTimerEnd = useCallback(
    (messageId: string) => {
      setState((prev) => ({
        ...prev,
        fadingOutMessages: new Set(prev.fadingOutMessages).add(messageId),
      }));

      cleanupTimeouts([messageId]);

      timeoutRefs.current[messageId] = setTimeout(() => {
        setState((currentState) => {
          const nextUnshown = findNextUnshownMessage();
          shownMessageIds.current.add(messageId);

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
              : (() => {
                  const next = { ...currentState.messageTimers };
                  delete next[messageId];
                  return next;
                })(),

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

  // Reinicia fila ao mudar mobile ↔ desktop
  useEffect(() => {
    if (prevMaxConcurrent.current !== maxConcurrent) {
      prevMaxConcurrent.current = maxConcurrent;
      resetQueue();
    }
  }, [maxConcurrent, resetQueue]);

  // Inicialização e limpeza quando a lista de mensagens muda
  useEffect(() => {
    const currentIds = new Set(messages.map((m) => m.id));
    const removedIds = Array.from(shownMessageIds.current).filter(
      (id) => !currentIds.has(id)
    );
    if (removedIds.length) {
      removedIds.forEach((id) => shownMessageIds.current.delete(id));
      cleanupTimeouts(removedIds);
    }

    if (!isInitialized.current && messages.length > 0) {
      initialize();
    }
  }, [messages, maxConcurrent, initialize, cleanupTimeouts]);

  useEffect(() => {
    if (state.activeMessages.length === 0) return;

    intervalRef.current = setInterval(() => {
      setState((currentState) => {
        const newTimers = { ...currentState.messageTimers };
        let hasChanges = false;

        currentState.activeMessages.forEach((message) => {
          if (newTimers[message.id] > 0) {
            newTimers[message.id]--;
            hasChanges = true;

            if (newTimers[message.id] === 0) {
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

"use client";

import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { QuickMessage } from "../types/structure/QuickMessage";
import {
  needsAnimation,
  calculateAnimationDuration,
} from "../utils/quickMessagesUtils";
import { useLiveGlobalMessages } from "./useLiveGlobalMessages";
import {
  getGlobalMessagesHistory,
  type GlobalMessagesSnapshot,
} from "@/services/globalMessages";
import { mapGlobalMessageToQuickMessage } from "../utils/mapGlobalMessage";

interface UIState {
  historyOpen: boolean;
  messageModalOpen: boolean;
  composeOpen: boolean;
  selectedMessage: QuickMessage | null;
}

const HISTORY_LIMIT = 50;

function formatHistoryTimestamp(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const useQuickMessagesUI = (maxConcurrent = 3) => {
  const {
    activeMessages,
    messageTimers,
    fadingOutMessages,
    historySeed,
    applyIncoming,
  } = useLiveGlobalMessages(maxConcurrent);

  const [uiState, setUIState] = useState<UIState>({
    historyOpen: false,
    messageModalOpen: false,
    composeOpen: false,
    selectedMessage: null,
  });

  const [historyMessages, setHistoryMessages] = useState<QuickMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const messageRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>(
    {}
  );

  const mergeHistory = useCallback((incoming: QuickMessage[]) => {
    setHistoryMessages((prev) => {
      const map = new Map<string, QuickMessage>();
      [...incoming, ...prev].forEach((m) => {
        map.set(m.id, {
          ...m,
          timestamp: formatHistoryTimestamp(m.timestamp),
        });
      });
      return Array.from(map.values()).slice(0, HISTORY_LIMIT);
    });
  }, []);

  useEffect(() => {
    if (historySeed.length) mergeHistory(historySeed);
  }, [historySeed, mergeHistory]);

  useEffect(() => {
    const activeIds = new Set(activeMessages.map((msg) => msg.id));

    setHistoryMessages((prev) => {
      const map = new Map<string, QuickMessage>();
      prev.forEach((m) => map.set(m.id, m));

      activeMessages.forEach((msg) => {
        map.set(msg.id, {
          ...msg,
          status: "active",
          timeRemaining: `${messageTimers[msg.id] ?? 0}s`,
          timestamp: formatHistoryTimestamp(msg.timestamp),
        });
      });

      for (const [id, message] of map) {
        if (message.status === "active" && !activeIds.has(id)) {
          map.set(id, {
            ...message,
            status: "expired",
            timeRemaining: "0s",
          });
        }
      }

      return Array.from(map.values()).slice(0, HISTORY_LIMIT);
    });
  }, [activeMessages, messageTimers]);

  const loadServerHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const page = await getGlobalMessagesHistory();
      mergeHistory(page.results.map(mapGlobalMessageToQuickMessage));
    } finally {
      setHistoryLoading(false);
    }
  }, [mergeHistory]);

  useEffect(() => {
    if (uiState.historyOpen) {
      void loadServerHistory();
    }
  }, [uiState.historyOpen, loadServerHistory]);

  const setHistoryOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({ ...prev, historyOpen: open }));
  }, []);

  const setMessageModalOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({ ...prev, messageModalOpen: open }));
  }, []);

  const setComposeOpen = useCallback((open: boolean) => {
    setUIState((prev) => ({ ...prev, composeOpen: open }));
  }, []);

  const setSelectedMessage = useCallback((message: QuickMessage | null) => {
    setUIState((prev) => ({ ...prev, selectedMessage: message }));
  }, []);

  const handleMessageClick = useCallback((message: QuickMessage) => {
    setUIState((prev) => ({
      ...prev,
      selectedMessage: {
        ...message,
        timeRemaining: `${message.timeRemaining}`,
      },
      messageModalOpen: true,
    }));
  }, []);

  const handleHistoryMessageClick = useCallback((message: QuickMessage) => {
    setUIState((prev) => ({
      ...prev,
      messageModalOpen: true,
      selectedMessage: message,
    }));
  }, []);

  const handleCreated = useCallback(
    (snapshot: GlobalMessagesSnapshot) => {
      applyIncoming(snapshot);
    },
    [applyIncoming]
  );

  const selectedWithLiveTimer = useMemo(() => {
    const selected = uiState.selectedMessage;
    if (!selected) return null;
    const timer = messageTimers[selected.id];
    if (timer == null) return selected;
    return { ...selected, timeRemaining: `${timer}s` };
  }, [uiState.selectedMessage, messageTimers]);

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
  }, [activeMessages]);

  const getAnimationData = useCallback(
    (messageId: string) => {
      return animationData[messageId] || { shouldAnimate: false, duration: 0 };
    },
    [animationData]
  );

  return useMemo(
    () => ({
      activeMessages,
      messageTimers,
      fadingOutMessages,
      historyOpen: uiState.historyOpen,
      messageModalOpen: uiState.messageModalOpen,
      composeOpen: uiState.composeOpen,
      selectedMessage: selectedWithLiveTimer,
      messageRefs,
      historyMessages,
      historyLoading,
      setHistoryOpen,
      setMessageModalOpen,
      setComposeOpen,
      setSelectedMessage,
      handleMessageClick,
      handleHistoryMessageClick,
      handleCreated,
      getAnimationData,
    }),
    [
      activeMessages,
      messageTimers,
      fadingOutMessages,
      uiState.historyOpen,
      uiState.messageModalOpen,
      uiState.composeOpen,
      selectedWithLiveTimer,
      historyMessages,
      historyLoading,
      setHistoryOpen,
      setMessageModalOpen,
      setComposeOpen,
      setSelectedMessage,
      handleMessageClick,
      handleHistoryMessageClick,
      handleCreated,
      getAnimationData,
    ]
  );
};

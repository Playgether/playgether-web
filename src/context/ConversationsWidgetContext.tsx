"use client";

import { createContext, useCallback, useContext, useState } from "react";
import React from "react";

interface ConversationsWidgetContextType {
  pendingConvId: string | null;
  openWithConversation: (conversationId: string) => void;
  clearPending: () => void;
}

const ConversationsWidgetContext = createContext<ConversationsWidgetContextType | null>(null);

export function ConversationsWidgetProvider({ children }: { children: React.ReactNode }) {
  const [pendingConvId, setPendingConvId] = useState<string | null>(null);

  const openWithConversation = useCallback((conversationId: string) => {
    setPendingConvId(conversationId);
  }, []);

  const clearPending = useCallback(() => {
    setPendingConvId(null);
  }, []);

  return (
    <ConversationsWidgetContext.Provider value={{ pendingConvId, openWithConversation, clearPending }}>
      {children}
    </ConversationsWidgetContext.Provider>
  );
}

export function useConversationsWidget() {
  const ctx = useContext(ConversationsWidgetContext);
  if (!ctx) throw new Error("useConversationsWidget must be used within ConversationsWidgetProvider");
  return ctx;
}

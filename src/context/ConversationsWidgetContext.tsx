"use client";

import { createContext, useCallback, useContext, useState } from "react";
import React from "react";

export type MegaphoneReplyDraft = {
  authorUsername: string;
  authorName: string;
  quote: string;
  authorAvatar?: string;
};

export type OpenConversationOptions = {
  draft?: string;
  megaphoneReply?: MegaphoneReplyDraft;
};

interface ConversationsWidgetContextType {
  pendingConvId: string | null;
  pendingDraft: string | null;
  pendingMegaphoneReply: MegaphoneReplyDraft | null;
  openWithConversation: (
    conversationId: string,
    options?: OpenConversationOptions
  ) => void;
  clearPending: () => void;
}

const ConversationsWidgetContext =
  createContext<ConversationsWidgetContextType | null>(null);

export function ConversationsWidgetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingConvId, setPendingConvId] = useState<string | null>(null);
  const [pendingDraft, setPendingDraft] = useState<string | null>(null);
  const [pendingMegaphoneReply, setPendingMegaphoneReply] =
    useState<MegaphoneReplyDraft | null>(null);

  const openWithConversation = useCallback(
    (conversationId: string, options?: OpenConversationOptions) => {
      setPendingConvId(conversationId);
      setPendingDraft(options?.draft ?? null);
      setPendingMegaphoneReply(options?.megaphoneReply ?? null);
    },
    []
  );

  const clearPending = useCallback(() => {
    setPendingConvId(null);
    setPendingDraft(null);
    setPendingMegaphoneReply(null);
  }, []);

  return (
    <ConversationsWidgetContext.Provider
      value={{
        pendingConvId,
        pendingDraft,
        pendingMegaphoneReply,
        openWithConversation,
        clearPending,
      }}
    >
      {children}
    </ConversationsWidgetContext.Provider>
  );
}

export function useConversationsWidget() {
  const ctx = useContext(ConversationsWidgetContext);
  if (!ctx)
    throw new Error(
      "useConversationsWidget must be used within ConversationsWidgetProvider"
    );
  return ctx;
}

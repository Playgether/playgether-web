"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getConversations } from "@/services/directMessages";
import { useDMNotifications } from "@/hooks/useDMNotifications";

interface DMUnreadContextValue {
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (count: number) => void;
}

const DMUnreadContext = createContext<DMUnreadContextValue>({ unreadCount: 0, refresh: async () => {}, markRead: () => {} });

export function DMUnreadProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const convs = await getConversations();
      const total = convs.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
      setUnreadCount(total);
    } catch {
      // silently ignore
    }
  }, []);

  const markRead = useCallback((count: number) => {
    setUnreadCount((prev) => Math.max(0, prev - count));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Atualiza badge em tempo real quando qualquer DM chega
  useDMNotifications({ onNotification: useCallback(() => { refresh(); }, [refresh]) });

  return (
    <DMUnreadContext.Provider value={{ unreadCount, refresh, markRead }}>
      {children}
    </DMUnreadContext.Provider>
  );
}

export const useDMUnread = () => useContext(DMUnreadContext);

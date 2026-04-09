"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSecureWebSocket } from "@/hooks/useSecureWebSocket";
import { useAuthContext } from "./AuthContext";
import { ReadyState } from "react-use-websocket";

export type PresenceRecord = {
  status: string;
  last_seen: string | null;
};

type PresenceContextValue = {
  getPresence: (userId: number | undefined) => PresenceRecord;
  isPresenceConnected: boolean;
};

const defaultPresence = (): PresenceRecord => ({
  status: "offline",
  last_seen: null,
});

export const PresenceContext = createContext<PresenceContextValue | null>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedOut } = useAuthContext();
  const [presenceByUserId, setPresenceByUserId] = useState<
    Record<number, PresenceRecord>
  >({});

  const applySnapshot = useCallback((raw: Record<string, unknown>) => {
    setPresenceByUserId((prev) => {
      const next = { ...prev };
      for (const [k, v] of Object.entries(raw)) {
        const uid = Number(k);
        if (Number.isNaN(uid)) continue;
        if (v && typeof v === "object" && "status" in v) {
          const o = v as { status?: string; last_seen?: string | null };
          next[uid] = {
            status: String(o.status ?? "offline"),
            last_seen: o.last_seen ?? null,
          };
        }
      }
      return next;
    });
  }, []);

  const handleMessage = useCallback(
    (message: unknown) => {
      if (!message || typeof message !== "object") return;
      const msg = message as Record<string, unknown>;
      if (msg.type === "snapshot" && msg.presence && typeof msg.presence === "object") {
        applySnapshot(msg.presence as Record<string, unknown>);
        return;
      }
      if (msg.type === "update" && msg.user_id != null) {
        const uid = Number(msg.user_id);
        if (Number.isNaN(uid)) return;
        setPresenceByUserId((prev) => ({
          ...prev,
          [uid]: {
            status: String(msg.status ?? "offline"),
            last_seen:
              typeof msg.last_seen === "string" || msg.last_seen === null
                ? (msg.last_seen as string | null)
                : null,
          },
        }));
      }
    },
    [applySnapshot]
  );

  const loggedIn = !isLoggedOut && !!user?.user_id;
  const presenceLoginRef = useRef(false);

  const { sendMessage, readyState, isConnected, reconnect } = useSecureWebSocket({
    url: "/ws/presence/",
    shouldReconnect: () => true,
    onMessage: handleMessage,
  });

  useEffect(() => {
    if (!loggedIn) {
      presenceLoginRef.current = false;
      setPresenceByUserId({});
      return;
    }
    if (!presenceLoginRef.current) {
      presenceLoginRef.current = true;
      reconnect();
    }
  }, [loggedIn, reconnect]);

  useEffect(() => {
    if (!loggedIn || !isConnected) return;
    const beat = () => {
      sendMessage(JSON.stringify({ type: "heartbeat" }));
    };
    beat();
    const id = window.setInterval(beat, 40_000);
    return () => window.clearInterval(id);
  }, [loggedIn, isConnected, sendMessage]);

  useEffect(() => {
    if (!loggedIn || !isConnected) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        sendMessage(JSON.stringify({ type: "status", status: "away" }));
      } else {
        sendMessage(JSON.stringify({ type: "status", status: "online" }));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [loggedIn, isConnected, sendMessage]);

  const getPresence = useCallback(
    (userId: number | undefined): PresenceRecord => {
      if (userId == null || Number.isNaN(userId)) return defaultPresence();
      return presenceByUserId[userId] ?? defaultPresence();
    },
    [presenceByUserId]
  );

  const value = useMemo<PresenceContextValue>(
    () => ({
      getPresence,
      isPresenceConnected: loggedIn && readyState === ReadyState.OPEN,
    }),
    [getPresence, loggedIn, readyState]
  );

  return (
    <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>
  );
}

export function usePresenceContext(): PresenceContextValue {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresenceContext must be used within PresenceProvider");
  }
  return ctx;
}

export function usePresence(userId: number | undefined): PresenceRecord {
  const ctx = useContext(PresenceContext);
  if (!ctx) return defaultPresence();
  return !userId ? defaultPresence() : ctx.getPresence(userId);
}

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
import { PresencePickerDialog } from "@/components/presence/PresencePickerDialog";

export type ManualPresenceMode = "auto" | "online" | "away" | "dnd" | "offline";

export type PresenceRecord = {
  status: string;
  last_seen: string | null;
};

const STORAGE_KEY = "playgether_presence_manual_v1";
const IDLE_MS = 3 * 60 * 1000;
const IDLE_TICK_MS = 20_000;

type PresenceContextValue = {
  getPresence: (userId: number | undefined) => PresenceRecord;
  /** Status efetivo que você transmite (e vê na sua bolinha). */
  getSelfPresenceDisplay: () => PresenceRecord;
  isPresenceConnected: boolean;
  manualPresenceMode: ManualPresenceMode;
  setManualPresenceMode: (m: ManualPresenceMode) => void;
  openPresencePicker: () => void;
};

const defaultPresence = (): PresenceRecord => ({
  status: "offline",
  last_seen: null,
});

export const PresenceContext = createContext<PresenceContextValue | null>(null);

function throttle(fn: () => void, ms: number) {
  let last = 0;
  return () => {
    const n = Date.now();
    if (n - last < ms) return;
    last = n;
    fn();
  };
}

function readStoredManual(): ManualPresenceMode {
  if (typeof window === "undefined") return "auto";
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    if (
      r === "auto" ||
      r === "online" ||
      r === "away" ||
      r === "dnd" ||
      r === "offline"
    ) {
      return r;
    }
  } catch {
    /* ignore */
  }
  return "auto";
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedOut } = useAuthContext();
  const [presenceByUserId, setPresenceByUserId] = useState<
    Record<number, PresenceRecord>
  >({});
  const [manualPresenceMode, setManualPresenceModeState] =
    useState<ManualPresenceMode>("auto");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [idleTick, setIdleTick] = useState(0);

  const lastActivityRef = useRef<number>(Date.now());
  const lastSentStatusRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setManualPresenceModeState(readStoredManual());
  }, []);

  const setManualPresenceMode = useCallback((m: ManualPresenceMode) => {
    setManualPresenceModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  }, []);

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
      lastSentStatusRef.current = null;
      return;
    }
    if (!presenceLoginRef.current) {
      presenceLoginRef.current = true;
      reconnect();
    }
  }, [loggedIn, reconnect]);

  const computeEffectiveBroadcastStatus = useCallback((): string => {
    switch (manualPresenceMode) {
      case "offline":
        return "offline";
      case "online":
        return "online";
      case "away":
        return "away";
      case "dnd":
        return "dnd";
      case "auto":
      default:
        return Date.now() - lastActivityRef.current > IDLE_MS ? "away" : "online";
    }
  }, [manualPresenceMode]);

  useEffect(() => {
    if (!loggedIn || !isConnected) {
      if (!isConnected) lastSentStatusRef.current = null;
      return;
    }
    const next = computeEffectiveBroadcastStatus();
    if (lastSentStatusRef.current === next) return;
    sendMessage(JSON.stringify({ type: "status", status: next }));
    lastSentStatusRef.current = next;
  }, [
    loggedIn,
    isConnected,
    computeEffectiveBroadcastStatus,
    sendMessage,
    manualPresenceMode,
    idleTick,
  ]);

  useEffect(() => {
    if (!loggedIn || !isConnected) return;
    const beat = () => {
      const st = computeEffectiveBroadcastStatus();
      sendMessage(JSON.stringify({ type: "heartbeat", status: st }));
    };
    beat();
    const id = window.setInterval(beat, 40_000);
    return () => window.clearInterval(id);
  }, [loggedIn, isConnected, sendMessage, computeEffectiveBroadcastStatus]);

  useEffect(() => {
    if (!loggedIn) return;
    const id = window.setInterval(() => setIdleTick((x) => x + 1), IDLE_TICK_MS);
    return () => window.clearInterval(id);
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    const bump = () => {
      lastActivityRef.current = Date.now();
      if (manualPresenceMode === "auto") setIdleTick((x) => x + 1);
    };
    const throttled = throttle(bump, 750);
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    window.addEventListener("pointerdown", throttled, opts);
    window.addEventListener("keydown", throttled, opts);
    window.addEventListener("wheel", throttled, opts);
    window.addEventListener("touchstart", throttled, opts);
    window.addEventListener("scroll", throttled, opts);
    return () => {
      window.removeEventListener("pointerdown", throttled, opts);
      window.removeEventListener("keydown", throttled, opts);
      window.removeEventListener("wheel", throttled, opts);
      window.removeEventListener("touchstart", throttled, opts);
      window.removeEventListener("scroll", throttled, opts);
    };
  }, [loggedIn, manualPresenceMode]);

  const selfId = user?.user_id != null ? Number(user.user_id) : null;

  useEffect(() => {
    if (selfId == null || Number.isNaN(selfId)) return;
    const st = computeEffectiveBroadcastStatus();
    setPresenceByUserId((prev) => ({
      ...prev,
      [selfId]: {
        status: st,
        last_seen: prev[selfId]?.last_seen ?? null,
      },
    }));
  }, [selfId, computeEffectiveBroadcastStatus, idleTick, manualPresenceMode]);

  const getPresence = useCallback(
    (userId: number | undefined): PresenceRecord => {
      if (userId == null || Number.isNaN(userId)) return defaultPresence();
      return presenceByUserId[userId] ?? defaultPresence();
    },
    [presenceByUserId]
  );

  const getSelfPresenceDisplay = useCallback((): PresenceRecord => {
    if (selfId == null || Number.isNaN(selfId) || !loggedIn) {
      return defaultPresence();
    }
    const st = computeEffectiveBroadcastStatus();
    const wsOk =
      readyState === ReadyState.OPEN || readyState === ReadyState.CONNECTING;
    if (manualPresenceMode === "offline") {
      return { status: "offline", last_seen: null };
    }
    if (!wsOk) {
      return { status: "offline", last_seen: null };
    }
    return { status: st, last_seen: null };
  }, [
    selfId,
    loggedIn,
    computeEffectiveBroadcastStatus,
    manualPresenceMode,
    readyState,
  ]);

  const openPresencePicker = useCallback(() => setPickerOpen(true), []);

  const value = useMemo<PresenceContextValue>(
    () => ({
      getPresence,
      getSelfPresenceDisplay,
      isPresenceConnected: loggedIn && readyState === ReadyState.OPEN,
      manualPresenceMode,
      setManualPresenceMode,
      openPresencePicker,
    }),
    [
      getPresence,
      getSelfPresenceDisplay,
      loggedIn,
      readyState,
      manualPresenceMode,
      setManualPresenceMode,
      openPresencePicker,
    ]
  );

  return (
    <PresenceContext.Provider value={value}>
      {children}
      <PresencePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        manualPresenceMode={manualPresenceMode}
        setManualPresenceMode={setManualPresenceMode}
      />
    </PresenceContext.Provider>
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

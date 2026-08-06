"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSecureWebSocket } from "@/hooks/useSecureWebSocket";
import {
  getActiveGlobalMessages,
  tickGlobalMessages,
  type GlobalMessageDto,
  type GlobalMessagesSnapshot,
} from "@/services/globalMessages";
import { mapGlobalMessageToQuickMessage } from "../utils/mapGlobalMessage";
import type { QuickMessage } from "../types/structure/QuickMessage";

function remainingFromExpiresAt(expiresAt: string | null | undefined): number {
  if (!expiresAt) return 0;
  const ms = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

function applySnapshot(
  snapshot: GlobalMessagesSnapshot
): {
  messages: QuickMessage[];
  timers: Record<string, number>;
  raw: GlobalMessageDto[];
} {
  const raw = snapshot.messages ?? [];
  const timers: Record<string, number> = {};
  const messages = raw.map((msg) => {
    const remaining =
      msg.expires_at != null
        ? remainingFromExpiresAt(msg.expires_at)
        : Math.max(0, msg.remaining_seconds ?? msg.display_seconds);
    timers[msg.id] = remaining;
    const mapped = mapGlobalMessageToQuickMessage({
      ...msg,
      remaining_seconds: remaining,
    });
    return mapped;
  });
  return { messages, timers, raw };
}

export function useLiveGlobalMessages(maxConcurrent = 3) {
  const [activeMessages, setActiveMessages] = useState<QuickMessage[]>([]);
  const [messageTimers, setMessageTimers] = useState<Record<string, number>>(
    {}
  );
  const [fadingOutMessages, setFadingOutMessages] = useState<Set<string>>(
    () => new Set()
  );
  const [historySeed, setHistorySeed] = useState<QuickMessage[]>([]);
  const tickInFlight = useRef(false);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const applyIncoming = useCallback((snapshot: GlobalMessagesSnapshot) => {
    const { messages, timers, raw } = applySnapshot(snapshot);
    const limited = messages.slice(0, Math.max(1, Math.min(3, maxConcurrent)));
    const limitedTimers: Record<string, number> = {};
    limited.forEach((m) => {
      limitedTimers[m.id] = timers[m.id] ?? 0;
    });

    setActiveMessages((prev) => {
      const nextIds = new Set(limited.map((m) => m.id));
      const fading = new Set<string>();
      prev.forEach((m) => {
        if (!nextIds.has(m.id)) fading.add(m.id);
      });
      if (fading.size) {
        setFadingOutMessages(fading);
        setTimeout(() => setFadingOutMessages(new Set()), 300);
      }
      return limited;
    });
    setMessageTimers(limitedTimers);

    raw.forEach((msg) => {
      if (knownIdsRef.current.has(msg.id)) return;
      knownIdsRef.current.add(msg.id);
      setHistorySeed((prev) => {
        const mapped = mapGlobalMessageToQuickMessage(msg);
        if (prev.some((m) => m.id === mapped.id)) return prev;
        return [mapped, ...prev].slice(0, 50);
      });
    });
  }, [maxConcurrent]);

  useEffect(() => {
    let cancelled = false;
    getActiveGlobalMessages().then((snapshot) => {
      if (!cancelled) applyIncoming(snapshot);
    });
    return () => {
      cancelled = true;
    };
  }, [applyIncoming]);

  const handleWsMessage = useCallback(
    (data: GlobalMessagesSnapshot) => {
      if (!data || !Array.isArray(data.messages)) return;
      applyIncoming(data);
    },
    [applyIncoming]
  );

  const { sendMessage, readyState } = useSecureWebSocket({
    url: "/ws/global-messages/",
    onMessage: handleWsMessage,
  });

  const requestTick = useCallback(async () => {
    if (tickInFlight.current) return;
    tickInFlight.current = true;
    try {
      if (readyState === 1) {
        sendMessage(JSON.stringify({ type: "tick" }));
      } else {
        const snapshot = await tickGlobalMessages();
        if (snapshot) applyIncoming(snapshot);
      }
    } finally {
      tickInFlight.current = false;
    }
  }, [applyIncoming, readyState, sendMessage]);

  useEffect(() => {
    if (activeMessages.length === 0) return;

    const interval = setInterval(() => {
      setMessageTimers((prev) => {
        const next = { ...prev };
        let shouldTick = false;
        activeMessages.forEach((msg) => {
          const fromExpiry = remainingFromExpiresAt(msg.expiresAt);
          const current = Math.min(prev[msg.id] ?? fromExpiry, fromExpiry);
          const value = Math.max(0, current - 1);
          next[msg.id] = value;
          if (value <= 0) shouldTick = true;
        });
        if (shouldTick) {
          setTimeout(() => {
            void requestTick();
          }, 0);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeMessages, requestTick]);

  const visibleMessages = useMemo(
    () => activeMessages.slice(0, maxConcurrent),
    [activeMessages, maxConcurrent]
  );

  return {
    activeMessages: visibleMessages,
    messageTimers,
    fadingOutMessages,
    historySeed,
    requestTick,
    applyIncoming,
  };
}

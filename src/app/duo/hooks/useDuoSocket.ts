"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DuoMatch,
  GamePreferences,
  WsMessage,
  WsQueueStatus,
} from "../types/duo";

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ||
  (typeof window !== "undefined"
    ? `ws://${window.location.host}`
    : "ws://localhost:8000");

interface UseDuoSocketOptions {
  gameSlug: string;
  enabled?: boolean;
}

interface DuoSocketState {
  connected: boolean;
  queueStatus: WsQueueStatus | null;
  expiresAt: string | null;
  isNearExpiry: boolean;
  matches: DuoMatch[];
  error: string | null;
}

interface DuoSocketActions {
  startSearch: (preferences: Partial<GamePreferences>) => void;
  leaveQueue: () => void;
  renewQueue: () => void;
  updatePreferences: (preferences: Partial<GamePreferences>) => void;
}

export function useDuoSocket({
  gameSlug,
  enabled = true,
}: UseDuoSocketOptions): DuoSocketState & DuoSocketActions {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<DuoSocketState>({
    connected: false,
    queueStatus: null,
    expiresAt: null,
    isNearExpiry: false,
    matches: [],
    error: null,
  });

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!enabled || !gameSlug) return;

    const token =
      typeof document !== "undefined"
        ? document.cookie.match(/access_token=([^;]+)/)?.[1]
        : null;

    const url = `${WS_BASE}/ws/duo/${gameSlug}/`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setState((s) => ({ ...s, connected: true, error: null }));
    };

    ws.onclose = () => {
      setState((s) => ({ ...s, connected: false }));
    };

    ws.onerror = () => {
      setState((s) => ({ ...s, error: "WebSocket connection error" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        handleMessage(msg);
      } catch {
        // ignore malformed messages
      }
    };

    function handleMessage(msg: WsMessage) {
      switch (msg.type) {
        case "duo_queue_status":
          setState((s) => ({
            ...s,
            queueStatus: msg.status,
            expiresAt: msg.expires_at ?? s.expiresAt,
            isNearExpiry: msg.is_near_expiry ?? s.isNearExpiry,
            error: null,
          }));
          break;

        case "duo_match":
          setState((s) => ({
            ...s,
            matches: dedupeMatches([...s.matches, msg.match]),
          }));
          break;

        case "duo_existing_matches":
          setState((s) => ({
            ...s,
            matches: dedupeMatches([...s.matches, ...msg.matches]),
          }));
          break;

        case "error":
          setState((s) => ({ ...s, error: msg.message }));
          break;
      }
    }

    return () => {
      ws.close();
    };
  }, [enabled, gameSlug]);

  const startSearch = useCallback(
    (preferences: Partial<GamePreferences>) => {
      send({ type: "start_search", preferences });
    },
    [send]
  );

  const leaveQueue = useCallback(() => {
    send({ type: "leave_queue" });
  }, [send]);

  const renewQueue = useCallback(() => {
    send({ type: "renew_queue" });
  }, [send]);

  const updatePreferences = useCallback(
    (preferences: Partial<GamePreferences>) => {
      send({ type: "update_preferences", preferences });
    },
    [send]
  );

  return { ...state, startSearch, leaveQueue, renewQueue, updatePreferences };
}

function dedupeMatches(matches: DuoMatch[]): DuoMatch[] {
  const seen = new Set<number>();
  return matches.filter((m) => {
    if (seen.has(m.id)) return false;
    seen.add(m.id);
    return true;
  });
}

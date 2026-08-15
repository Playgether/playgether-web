"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMatches } from "../services/duoApi";
import type {
  DuoMatch,
  GamePreferences,
  WsMessage,
  WsQueueStatus,
} from "../types/duo";
import {
  buildAuthenticatedWebSocketUrl,
  requestWebSocketTicket,
} from "@/lib/websocketAuth";

interface UseDuoSocketOptions {
  gameSlug: string;
  enabled?: boolean;
}

interface DuoSocketState {
  connected: boolean;
  queueStatus: WsQueueStatus | null;
  expiresAt: string | null;
  isNearExpiry: boolean;
  /** Present when `queueStatus === "evicted"` (ex.: `afk`, `expired`). */
  evictionReason: string | null;
  matches: DuoMatch[];
  error: string | null;
}

interface DuoSocketActions {
  startSearch: (preferences: Partial<GamePreferences>) => void;
  leaveQueue: () => void;
  renewQueue: () => void;
  updatePreferences: (preferences: Partial<GamePreferences>) => void;
  /** Alinha a lista com o backend (F5, foco na aba, parceiro saiu da fila). */
  refreshMatches: () => void;
  /** Mantém o backend ciente de que o usuário está em /duo resultados (evita notificação in-app duplicada). */
  pulseDuoResultsPresence: () => void;
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
    evictionReason: null,
    matches: [],
    error: null,
  });

  const send = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const refreshMatches = useCallback(() => {
    if (!gameSlug) return;
    getMatches(gameSlug)
      .then((list) => {
        setState((s) => ({ ...s, matches: dedupeMatches(list) }));
      })
      .catch(() => {});
  }, [gameSlug]);

  useEffect(() => {
    if (!enabled || !gameSlug) return;
    refreshMatches();
  }, [enabled, gameSlug, refreshMatches]);

  useEffect(() => {
    if (!enabled) return;
    const onVis = () => {
      if (document.visibilityState === "visible") refreshMatches();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [enabled, refreshMatches]);

  useEffect(() => {
    if (!enabled || !gameSlug) return;

    let cancelled = false;
    let ws: WebSocket | null = null;

    function handleMessage(msg: WsMessage) {
      switch (msg.type) {
        case "duo_queue_status": {
          const clearsEviction =
            msg.status === "searching" ||
            msg.status === "in_queue" ||
            msg.status === "renewed" ||
            msg.status === "preferences_updated" ||
            msg.status === "not_in_queue" ||
            msg.status === "left";
          setState((s) => ({
            ...s,
            queueStatus: msg.status,
            expiresAt:
              msg.status === "evicted" ? null : (msg.expires_at ?? s.expiresAt),
            isNearExpiry: msg.is_near_expiry ?? s.isNearExpiry,
            evictionReason:
              msg.status === "evicted"
                ? (msg.reason ?? "afk")
                : clearsEviction
                  ? null
                  : s.evictionReason,
            error: null,
          }));
          break;
        }

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

    fetch("/api/notifications-ws-token", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { ticket: null }))
      .then((data: { ticket?: string | null }) => {
        if (cancelled) return;
        if (!data?.ticket) {
          setState((s) => ({
            ...s,
            error: "Faça login para usar o Duo Finder.",
            connected: false,
          }));
          return;
        }

        const base = wsBaseUrl().replace(/\/$/, "");
        const wsUrl = `${base}/ws/duo/${encodeURIComponent(gameSlug)}/?ticket=${encodeURIComponent(data.ticket)}`;

        ws = new WebSocket(wsUrl);
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
      })
      .catch(() => {
        if (!cancelled) {
          setState((s) => ({
            ...s,
            error: "Não foi possível autenticar o WebSocket.",
          }));
        }
      });

    return () => {
      cancelled = true;
      ws?.close();
      wsRef.current = null;
    };
  }, [enabled, gameSlug]);

  const startSearch = useCallback(
    (preferences: Partial<GamePreferences>) => {
      send({ type: "start_search", preferences });
    },
    [send],
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
    [send],
  );

  const pulseDuoResultsPresence = useCallback(() => {
    send({ type: "results_heartbeat" });
  }, [send]);

  return {
    ...state,
    startSearch,
    leaveQueue,
    renewQueue,
    updatePreferences,
    refreshMatches,
    pulseDuoResultsPresence,
  };
}

function dedupeMatches(matches: DuoMatch[]): DuoMatch[] {
  const seen = new Set<string>();
  return matches.filter((m) => {
    const k = `${m.id}-${m.partner?.user_id ?? ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

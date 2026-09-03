"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getMatches } from "../services/duoApi";
import type {
  DuoMatch,
  GamePreferences,
  WsInviteUpdateMsg,
  WsMessage,
  WsQueueStatus,
} from "../types/duo";
import {
  buildAuthenticatedWebSocketUrl,
  getWebSocketBaseUrl,
  requestWebSocketTicket,
} from "@/lib/websocketAuth";

interface UseDuoSocketOptions {
  gameSlug: string;
  enabled?: boolean;
  onInviteUpdate?: (msg: WsInviteUpdateMsg) => void;
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
  /** Optimistic local patch after sending an invite from MatchCard. */
  patchMatchInvite: (
    matchId: number,
    patch: Pick<DuoMatch, "invite_status" | "invite_direction" | "outgoing_invite_status">,
  ) => void;
}

export function useDuoSocket({
  gameSlug,
  enabled = true,
  onInviteUpdate,
}: UseDuoSocketOptions): DuoSocketState & DuoSocketActions {
  const wsRef = useRef<WebSocket | null>(null);
  const onInviteUpdateRef = useRef(onInviteUpdate);
  onInviteUpdateRef.current = onInviteUpdate;

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

  const patchMatchInvite = useCallback(
    (
      matchId: number,
      patch: Pick<
        DuoMatch,
        "invite_status" | "invite_direction" | "outgoing_invite_status"
      >,
    ) => {
      setState((s) => ({
        ...s,
        matches: s.matches.map((m) =>
          m.id === matchId ? { ...m, ...patch } : m,
        ),
      }));
    },
    [],
  );

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

        case "duo_invite_update": {
          const active =
            msg.status === "pending" ||
            msg.status === "accepted" ||
            msg.status === "declined";
          setState((s) => ({
            ...s,
            matches: s.matches.map((m) =>
              m.id === msg.match_id
                ? {
                    ...m,
                    outgoing_invite_status:
                      msg.direction === "received"
                        ? m.outgoing_invite_status
                        : msg.status,
                    invite_status: active ? msg.status : null,
                    invite_direction: active
                      ? (msg.direction ?? m.invite_direction ?? null)
                      : null,
                  }
                : m,
            ),
          }));
          onInviteUpdateRef.current?.(msg);
          break;
        }

        case "error":
          setState((s) => ({ ...s, error: msg.message }));
          break;
      }
    }

    const socketPath = `/ws/duo/${encodeURIComponent(gameSlug)}/`;
    requestWebSocketTicket(socketPath)
      .then(({ ticket }) => {
        if (cancelled) return;
        const wsUrl = buildAuthenticatedWebSocketUrl(socketPath, ticket);
        if (!data?.ticket) {
          setState((s) => ({
            ...s,
            error: "Faça login para usar o Duo Finder.",
            connected: false,
          }));
          return;
        }

        const base = getWebSocketBaseUrl();
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
    patchMatchInvite,
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

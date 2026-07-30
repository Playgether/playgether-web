"use client";

import { fetchRoomEventMessages } from "@/actions/roomEventsActions";
import type { RoomEventMessage } from "@/types/RoomEvents";
import { useCallback, useEffect, useRef, useState } from "react";

export type RoomEventPresenceViewer = {
  user_id: string | number;
  username: string;
  is_active_player: boolean;
  is_eliminated: boolean;
};

function wsBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.hostname}:8000`;
  }
  return "ws://localhost:8000";
}

export function useRoomEventSocket(eventId: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notices, setNotices] = useState<{ code: string; message: string }[]>([]);
  const [state, setState] = useState<Record<string, unknown> | null>(null);
  const [buttonWinnerId, setButtonWinnerId] = useState<number | null>(null);
  const [eventMessages, setEventMessages] = useState<RoomEventMessage[]>([]);
  const [presence, setPresence] = useState<{
    viewers: RoomEventPresenceViewer[];
    sessionLiveCount: number;
    sessionEligibleTotal: number;
  } | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEventMessages([]);
      return;
    }
    let cancelled = false;
    fetchRoomEventMessages(eventId).then((r) => {
      if (!cancelled && r.ok) setEventMessages(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    if (!socketError) return;
    const t = window.setTimeout(() => setSocketError(null), 6000);
    return () => window.clearTimeout(t);
  }, [socketError]);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    fetch("/api/notifications-ws-token", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { ticket: null }))
      .then((data: { ticket?: string | null }) => {
        if (cancelled || !data?.ticket) return;
        const wsUrl = `${wsBaseUrl().replace(/\/$/, "")}/ws/room-events/${eventId}/?ticket=${encodeURIComponent(data.ticket)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg?.type === "error" && msg.message) {
              setSocketError(String(msg.message));
            }
            if (msg?.type === "event_notice" && msg.notice) {
              setNotices((prev) => [...prev.slice(-24), msg.notice]);
            }
            if (msg?.type === "event_state_update" && msg.state) {
              setState(msg.state);
            }
            if (msg?.type === "button_claimed") {
              setButtonWinnerId(Number(msg.winner_user_id));
            }
            if (msg?.type === "event_message" && msg.message) {
              const m = msg.message as RoomEventMessage;
              setEventMessages((prev) => {
                if (prev.some((x) => x.id === m.id)) return prev;
                return [...prev, m];
              });
            }
            if (msg?.type === "event_message_deleted" && msg.message_id != null) {
              const deletedId = Number(msg.message_id);
              if (Number.isFinite(deletedId)) {
                setEventMessages((prev) => prev.filter((x) => x.id !== deletedId));
              }
            }
            if (msg?.type === "presence_update" && Array.isArray(msg.viewers)) {
              setPresence({
                viewers: msg.viewers as RoomEventPresenceViewer[],
                sessionLiveCount: Number(msg.session_live_count ?? 0),
                sessionEligibleTotal: Number(msg.session_eligible_total ?? 0),
              });
            }
          } catch {
            // ignore malformed messages
          }
        };
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [eventId]);

  const send = (payload: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  const claimButton = useCallback(() => {
    setSocketError(null);
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setSocketError("Conexão com o evento indisponível. Aguarde “Ao vivo” ou atualize a página.");
      return;
    }
    send({ type: "claim_button" });
  }, []);

  const removeEventMessage = useCallback((messageId: number) => {
    setEventMessages((prev) => prev.filter((x) => x.id !== messageId));
  }, []);

  return {
    connected,
    notices,
    state,
    buttonWinnerId,
    eventMessages,
    presence,
    socketError,
    sendMessage: (body: string) => send({ type: "send_message", body }),
    claimButton,
    removeEventMessage,
  };
}

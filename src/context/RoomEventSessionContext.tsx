"use client";

import { beginAfterRecruitment, fetchRoomEvent, listRoomEvents } from "@/actions/roomEventsActions";
import { ChatRoom } from "@/types/ChatRoom";
import type { RoomEvent, RoomEventParticipant } from "@/types/RoomEvents";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuthContext } from "./AuthContext";

export type RoomEventSessionContextValue = {
  room: ChatRoom;
  activeEvent: RoomEvent | null;
  refreshActiveEvent: () => Promise<void>;
  /** Evento em andamento: abas da sala bloqueadas. */
  sessionLocked: boolean;
  /** Tela cheia do evento (ao vivo ou resultado final até o usuário fechar). */
  eventShellOpen: boolean;
  dismissEventResults: () => void;
  myParticipation: RoomEventParticipant | undefined;
  isOrganizer: boolean;
};

const RoomEventSessionContext = createContext<RoomEventSessionContextValue | null>(null);

export function RoomEventSessionProvider({
  room,
  children,
}: {
  room: ChatRoom;
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const [activeEvent, setActiveEvent] = useState<RoomEvent | null>(null);
  const [resultsDismissedForEventId, setResultsDismissedForEventId] = useState<number | null>(null);
  const activeEventRef = useRef<RoomEvent | null>(null);
  activeEventRef.current = activeEvent;

  const refreshActiveEvent = useCallback(async () => {
    const r = await listRoomEvents(room.slug, { activeOnly: true });
    if (!r.ok) return;
    const first = r.data[0] ?? null;

    if (first) {
      const full = await fetchRoomEvent(first.id);
      if (full.ok) setActiveEvent(full.data);
      else setActiveEvent(first);
      return;
    }

    const prev = activeEventRef.current;
    if (prev?.status === "running") {
      const full = await fetchRoomEvent(prev.id);
      if (full.ok && full.data.status === "finished") {
        setActiveEvent(full.data);
        return;
      }
    }
    if (prev?.status === "finished" && prev.id) {
      const full = await fetchRoomEvent(prev.id);
      if (full.ok && full.data.status === "finished") {
        setActiveEvent(full.data);
        return;
      }
    }
    setActiveEvent(null);
  }, [room.slug]);

  useEffect(() => {
    refreshActiveEvent();
  }, [refreshActiveEvent]);

  useEffect(() => {
    const onSync = () => {
      void refreshActiveEvent();
    };
    window.addEventListener("playgether:room-event-sync", onSync);
    return () => window.removeEventListener("playgether:room-event-sync", onSync);
  }, [refreshActiveEvent]);

  useEffect(() => {
    const onFocus = () => {
      void refreshActiveEvent();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refreshActiveEvent();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshActiveEvent]);

  useEffect(() => {
    if (!activeEvent?.id) return;
    if (activeEvent.status !== "finished") {
      setResultsDismissedForEventId(null);
    }
  }, [activeEvent?.id, activeEvent?.status]);

  useEffect(() => {
    if (!activeEvent || activeEvent.status !== "recruiting" || !activeEvent.recruitment_deadline_at) return;
    const end = new Date(activeEvent.recruitment_deadline_at).getTime();
    const organizerId = activeEvent.created_by;
    let done = false;
    const id = window.setInterval(async () => {
      if (done || Date.now() < end) return;
      done = true;
      const result = await beginAfterRecruitment(activeEvent.id);
      await refreshActiveEvent();
      if (
        !result.ok &&
        typeof result.error === "string" &&
        result.error.includes("Não houve participantes suficientes") &&
        organizerId != null
      ) {
        window.dispatchEvent(
          new CustomEvent("playgether:room-event-sync", {
            detail: {
              reason: "event_cancelled",
              message: result.error,
              organizer_user_id: organizerId,
            },
          })
        );
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeEvent?.id, activeEvent?.status, activeEvent?.recruitment_deadline_at, refreshActiveEvent]);

  const myParticipation = activeEvent?.participants?.find((p) => p.user === user?.user_id);

  const sessionLocked = Boolean(
    activeEvent &&
      activeEvent.status === "running" &&
      myParticipation?.participation_confirmed &&
      !myParticipation?.invitation_declined &&
      !myParticipation?.left_early
  );

  const eventShellOpen = Boolean(
    activeEvent &&
      myParticipation?.participation_confirmed &&
      !myParticipation?.invitation_declined &&
      !myParticipation?.left_early &&
      (activeEvent.status === "running" ||
        (activeEvent.status === "finished" && resultsDismissedForEventId !== activeEvent.id))
  );

  const dismissEventResults = useCallback(() => {
    const id = activeEventRef.current?.id;
    if (id != null) setResultsDismissedForEventId(id);
    setActiveEvent(null);
  }, []);

  const isOrganizer = Boolean(user?.user_id && activeEvent && activeEvent.created_by === user.user_id);

  const value = useMemo(
    () => ({
      room,
      activeEvent,
      refreshActiveEvent,
      sessionLocked,
      eventShellOpen,
      dismissEventResults,
      myParticipation,
      isOrganizer,
    }),
    [
      room,
      activeEvent,
      refreshActiveEvent,
      sessionLocked,
      eventShellOpen,
      dismissEventResults,
      myParticipation,
      isOrganizer,
    ]
  );

  return <RoomEventSessionContext.Provider value={value}>{children}</RoomEventSessionContext.Provider>;
}

export function useRoomEventSession(): RoomEventSessionContextValue {
  const ctx = useContext(RoomEventSessionContext);
  if (!ctx) {
    throw new Error("useRoomEventSession must be used within RoomEventSessionProvider");
  }
  return ctx;
}

"use client";



import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

  useTransition,

} from "react";

import { fetchRoomPermissions } from "@/actions/roomRolesActions";

import { formatMuteNotice } from "@/lib/roomModeration";

import { hasRoomPermission } from "@/lib/roomPermissions";

import type {

  RoomPermissionKey,

  RoomPermissionsSnapshot,

} from "@/types/RoomPermissions";

import { ChatRoom } from "@/types/ChatRoom";



export type MuteNoticePayload = {

  message?: string;

  expires_at?: string | null;

  duration_seconds?: number | null;

  remaining_seconds?: number | null;

};



type RoomPermissionsContextValue = {

  snapshot: RoomPermissionsSnapshot | null;

  loading: boolean;

  refresh: () => Promise<void>;

  can: (key: RoomPermissionKey) => boolean;

  setSnapshot: (next: RoomPermissionsSnapshot | null) => void;

  muteNotice: string | null;

  applyMuteNotice: (payload: MuteNoticePayload) => void;

  clearMuteNotice: () => void;

};



const RoomPermissionsContext = createContext<RoomPermissionsContextValue | null>(

  null,

);



function muteFromSnapshot(snapshot: RoomPermissionsSnapshot | null): string | null {

  const mute = snapshot?.active_mute;

  if (!mute) return null;

  if (mute.is_permanent) {

    return formatMuteNotice({ duration_seconds: null, expires_at: null });

  }

  return formatMuteNotice({

    expires_at: mute.expires_at,

    remaining_seconds: mute.remaining_seconds,

  });

}



export function RoomPermissionsProvider({

  room,

  initialSnapshot,

  children,

}: {

  room: ChatRoom;

  initialSnapshot?: RoomPermissionsSnapshot | null;

  children: React.ReactNode;

}) {

  const [snapshot, setSnapshot] = useState<RoomPermissionsSnapshot | null>(

    initialSnapshot ?? null,

  );

  const [muteNotice, setMuteNotice] = useState<string | null>(() =>

    muteFromSnapshot(initialSnapshot ?? null),

  );

  const [loading, setLoading] = useState(!initialSnapshot);

  const [, startTransition] = useTransition();



  const applyMuteNotice = useCallback((payload: MuteNoticePayload) => {

    const direct = payload.message?.trim();

    if (direct) {

      setMuteNotice(direct);

      return;

    }

    setMuteNotice(

      formatMuteNotice({

        expires_at: payload.expires_at,

        duration_seconds: payload.duration_seconds,

        remaining_seconds: payload.remaining_seconds,

      }),

    );

  }, []);



  const clearMuteNotice = useCallback(() => setMuteNotice(null), []);



  const refresh = useCallback(async () => {

    const res = await fetchRoomPermissions(room.slug);

    if (res.ok) {

      setSnapshot(res.data);

      setMuteNotice(muteFromSnapshot(res.data));

    }

  }, [room.slug]);



  const load = useCallback(() => {

    startTransition(async () => {

      setLoading(true);

      await refresh();

      setLoading(false);

    });

  }, [refresh]);



  useEffect(() => {

    if (!initialSnapshot) load();

  }, [initialSnapshot, load]);



  useEffect(() => {

    const onSync = () => {

      void refresh();

    };

    window.addEventListener("playgether:room-permissions-sync", onSync);

    return () =>

      window.removeEventListener("playgether:room-permissions-sync", onSync);

  }, [refresh]);

  useEffect(() => {
    const expiresAt = snapshot?.active_mute?.expires_at;
    if (!expiresAt) return;
    const end = new Date(expiresAt).getTime();
    if (Number.isNaN(end)) return;
    const delay = end - Date.now();
    if (delay <= 0) {
      void refresh();
      return;
    }
    const timer = window.setTimeout(() => void refresh(), delay + 400);
    return () => window.clearTimeout(timer);
  }, [snapshot?.active_mute?.expires_at, refresh]);

  const can = useCallback(

    (key: RoomPermissionKey) => hasRoomPermission(snapshot, key),

    [snapshot],

  );



  const value = useMemo(

    () => ({

      snapshot,

      loading,

      refresh,

      can,

      setSnapshot,

      muteNotice,

      applyMuteNotice,

      clearMuteNotice,

    }),

    [

      snapshot,

      loading,

      refresh,

      can,

      muteNotice,

      applyMuteNotice,

      clearMuteNotice,

    ],

  );



  return (

    <RoomPermissionsContext.Provider value={value}>

      {children}

    </RoomPermissionsContext.Provider>

  );

}



export function useRoomPermissions() {

  const ctx = useContext(RoomPermissionsContext);

  if (!ctx) {

    throw new Error("useRoomPermissions must be used within RoomPermissionsProvider");

  }

  return ctx;

}



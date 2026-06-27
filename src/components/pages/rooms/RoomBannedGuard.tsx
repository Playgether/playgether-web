"use client";

import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import { storeRoomExpelledMessage } from "@/lib/roomExpelledStorage";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Redireciona quem está banido da sala (ex.: URL direta após F5). */
export function RoomBannedGuard({ roomSlug }: { roomSlug: string }) {
  const { snapshot } = useRoomPermissions();
  const router = useRouter();
  const redirected = useRef(false);

  useEffect(() => {
    const ban = snapshot?.active_room_ban;
    if (!ban || redirected.current) return;
    redirected.current = true;
    storeRoomExpelledMessage(
      roomSlug,
      ban.message || "Não foi possível entrar: você foi expulso desta sala.",
    );
    router.replace("/rooms");
  }, [snapshot?.active_room_ban, roomSlug, router]);

  return null;
}

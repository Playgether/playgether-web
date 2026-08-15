"use client";

import { ChatHandlerContextProvider } from "@/context/ChatHandlerContext";
import { RoomEventSessionProvider } from "@/context/RoomEventSessionContext";
import { RoomPermissionsProvider } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import type { RoomPermissionsSnapshot } from "@/types/RoomPermissions";
import { RoomBannedGuard } from "./RoomBannedGuard";

export function RoomShell({
  room,
  ticket,
  initialPermissions,
  children,
}: {
  room: ChatRoom;
  ticket: string;
  initialPermissions?: RoomPermissionsSnapshot | null;
  children: React.ReactNode;
}) {
  return (
    <RoomPermissionsProvider room={room} initialSnapshot={initialPermissions}>
      <RoomBannedGuard roomSlug={room.slug} />
      <ChatHandlerContextProvider
        chatroom={room.slug || room.group_name}
        ticket={ticket}
      >
        <RoomEventSessionProvider room={room}>
          {children}
        </RoomEventSessionProvider>
      </ChatHandlerContextProvider>
    </RoomPermissionsProvider>
  );
}

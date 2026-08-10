"use client";

import { ChatHandlerContextProvider } from "@/context/ChatHandlerContext";
import { RoomEventSessionProvider } from "@/context/RoomEventSessionContext";
import { RoomPermissionsProvider } from "@/context/RoomPermissionsContext";
import { ChatRoom } from "@/types/ChatRoom";
import type { RoomPermissionsSnapshot } from "@/types/RoomPermissions";
import { RoomBannedGuard } from "./RoomBannedGuard";

export function RoomShell({
  room,
  initialPermissions,
  children,
}: {
  room: ChatRoom;
  initialPermissions?: RoomPermissionsSnapshot | null;
  children: React.ReactNode;
}) {
  return (
    <RoomPermissionsProvider room={room} initialSnapshot={initialPermissions}>
      <RoomBannedGuard roomSlug={room.slug} />
      <ChatHandlerContextProvider chatroom={room.slug || room.group_name}>
        <RoomEventSessionProvider room={room}>{children}</RoomEventSessionProvider>
      </ChatHandlerContextProvider>
    </RoomPermissionsProvider>
  );
}

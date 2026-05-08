"use client";

import { ChatHandlerContextProvider } from "@/context/ChatHandlerContext";
import { RoomEventSessionProvider } from "@/context/RoomEventSessionContext";
import { ChatRoom } from "@/types/ChatRoom";

export function RoomShell({
  room,
  token,
  children,
}: {
  room: ChatRoom;
  token: string;
  children: React.ReactNode;
}) {
  return (
    <ChatHandlerContextProvider chatroom={room.slug || room.group_name} token={token}>
      <RoomEventSessionProvider room={room}>{children}</RoomEventSessionProvider>
    </ChatHandlerContextProvider>
  );
}

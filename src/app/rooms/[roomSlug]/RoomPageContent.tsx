import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { extractRoomFromDetailedBody } from "@/services/chatRoomApi";
import { getChatRoomDetailed } from "@/services/getChatRoomDetailed";
import RoomChatView from "@/components/pages/rooms/RoomChatView";
import { RoomShell } from "@/components/pages/rooms/RoomShell";
import type { RoomSessionMode } from "@/lib/roomRoutes";
import { getWsTicket } from "@/actions/getWsTicket";

export type RoomPageMode = RoomSessionMode | undefined;

export async function loadRoomPage(roomSlug: string) {
  if (!roomSlug) {
    throw new Error("roomSlug is undefined");
  }

  const [detailed, wsTicket] = await Promise.all([
    getChatRoomDetailed(String(roomSlug)),
    getWsTicket(),
  ]);

  if (detailed.status === "banned") {
    redirect(
      `/rooms?expelled_slug=${encodeURIComponent(roomSlug)}&expelled_msg=${encodeURIComponent(detailed.message)}`,
    );
  }

  if (!wsTicket) {
    throw new Error("Não foi possível obter ticket WS — usuário não autenticado");
  }

  const payload = detailed.status === "ok" ? detailed.data : null;
  const { room, messages, messagesNextPageUrl, roomPermissions } =
    extractRoomFromDetailedBody(payload ?? undefined);

  if (!room) {
    notFound();
  }

  return {
    wsTicket,
    room,
    messages,
    messagesNextPageUrl,
    roomPermissions,
  };
}

export async function RoomPageContent({
  roomSlug,
  mode,
}: {
  roomSlug: string;
  mode?: RoomPageMode;
}) {
  const { wsTicket, room, messages, messagesNextPageUrl, roomPermissions } =
    await loadRoomPage(roomSlug);

  return (
    <RoomShell room={room} ticket={wsTicket} initialPermissions={roomPermissions}>
      <BaseLayout>
        <div className="flex h-layout-main min-h-0 min-w-0 flex-col bg-background pl-0 md:pl-20">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[88rem] flex-1 flex-col px-0 py-0 md:p-6">
            <RoomChatView
              room={room}
              messages={messages}
              initialMessagesNextPageUrl={messagesNextPageUrl}
              initialMode={mode}
            />
          </div>
        </div>
      </BaseLayout>
    </RoomShell>
  );
}

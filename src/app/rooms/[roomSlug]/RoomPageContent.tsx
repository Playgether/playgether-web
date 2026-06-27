import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { cookies } from "next/headers";
import { extractRoomFromDetailedBody } from "@/services/chatRoomApi";
import { getChatRoomDetailed } from "@/services/getChatRoomDetailed";
import RoomChatView from "@/components/pages/rooms/RoomChatView";
import { RoomShell } from "@/components/pages/rooms/RoomShell";
import type { RoomSessionMode } from "@/lib/roomRoutes";

export type RoomPageMode = RoomSessionMode | undefined;

export async function loadRoomPage(roomSlug: string) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    throw new Error("access_token is undefined");
  }
  if (!roomSlug) {
    throw new Error("roomSlug is undefined");
  }

  const detailed = await getChatRoomDetailed(String(roomSlug));
  if (detailed.status === "banned") {
    redirect(
      `/rooms?expelled_slug=${encodeURIComponent(roomSlug)}&expelled_msg=${encodeURIComponent(detailed.message)}`,
    );
  }
  const payload = detailed.status === "ok" ? detailed.data : null;
  const { room, messages, messagesNextPageUrl, roomPermissions } =
    extractRoomFromDetailedBody(payload ?? undefined);

  if (!room) {
    notFound();
  }

  return {
    accessToken,
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
  const { accessToken, room, messages, messagesNextPageUrl, roomPermissions } =
    await loadRoomPage(roomSlug);

  return (
    <RoomShell room={room} token={accessToken} initialPermissions={roomPermissions}>
      <BaseLayout>
        <div className="flex h-layout-main min-h-0 min-w-0 flex-col bg-background pl-0 md:pl-20">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[88rem] flex-1 flex-col px-4 py-2 md:p-6">
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

import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import { ChatHandlerContextProvider } from "@/context/ChatHandlerContext";
import { cookies } from "next/headers";
import { extractRoomFromDetailedBody } from "@/services/chatRoomApi";
import { getChatRoomDetailed } from "@/services/getChatRoomDetailed";
import RoomChatView from "@/components/pages/rooms/RoomChatView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { roomSlug } = await params;
  const payload = await getChatRoomDetailed(String(roomSlug));
  const { room } = extractRoomFromDetailedBody(payload ?? undefined);
  return {
    title: `Playgether - ${room?.group_name || "Sala"}`,
  };
}

export default async function Page({ params }) {
  const { roomSlug } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    throw new Error("access_token is undefined");
  }
  if (!roomSlug) {
    throw new Error("roomSlug is undefined");
  }

  const payload = await getChatRoomDetailed(String(roomSlug));
  const { room, messages } = extractRoomFromDetailedBody(payload ?? undefined);

  if (!room) {
    notFound();
  }

  return (
    <ChatHandlerContextProvider chatroom={room.group_name} token={accessToken}>
      <BaseLayout>
        <div className="flex min-h-layout-main min-w-0 flex-col bg-background pl-0 md:pl-20">
          <div className="mx-auto flex min-h-0 w-full max-w-[88rem] flex-1 flex-col px-4 py-2 md:p-6">
            <RoomChatView room={room} messages={messages} />
          </div>
        </div>
      </BaseLayout>
    </ChatHandlerContextProvider>
  );
}

import BaseLayout from "@/components/layouts/BaseLayout";
import { Metadata } from "next";
import React from "react";
import { ChatComponents } from "@/components/elements/Chat";
import { ChatHandlerContextProvider } from "@/context/ChatHandlerContext";
import { cookies } from "next/headers";
import { getRoomMessages } from "@/services/getRoomMessages";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import { getChatRoomDetailed } from "@/services/getChatRoomDetailed";
import { ChatRoom } from "@/types/ChatRoom";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { name } = await params;
  return {
    title: `Playgether - ${name || "Sala Desconhecida"}`,
  };
}

export default async function Page({ params }) {
  const { name } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    throw new Error("access_token is undefined");
  }
  if (!name) {
    throw new Error("group_name is undefined");
  }

  const response = await getChatRoomDetailed(name);
  const messages: ChatRoomMessages = response?.data?.results?.messages;
  const room: ChatRoom = response?.data?.results?.group;

  return (
    <ChatHandlerContextProvider chatroom={name} token={accessToken}>
      <BaseLayout>
        <ChatComponents.Root>
          <ChatComponents.LeftRoomChat
            room_id={room.id}
            is_favorited={room.is_favorited}
          />
          <ChatComponents.RightRoomChat messages={messages} room={room} />
        </ChatComponents.Root>
      </BaseLayout>
    </ChatHandlerContextProvider>
  );
}

import NotFoundPages from "@/components/elements/NotFound/NotFoundPages";
import BaseLayout from "@/components/layouts/BaseLayout";
import CardRoomContainer from "@/components/pages/rooms/CardRoomContainer";
import { getChatRooms } from "@/services/getChatRooms";
import { ChatRoomPagination } from "@/types/ChatRoom";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Playgether - Rooms",
  description: "Find people to chat with",
};

export default async function Room() {
  const response = await getChatRooms();
  const rooms: ChatRoomPagination = response.data;
  return (
    <BaseLayout>
      <div className="h-fit mt-2 grid w-full grid-cols-[repeat(auto-fit,minmax(350px,1fr))]">
        {rooms && rooms.results.length > 0 ? (
          rooms.results.map((room) => (
            <>
              <CardRoomContainer
                name={room.group_name}
                summary={room.summary}
                banner={room.banner}
                key={room.id}
              />
            </>
          ))
        ) : (
          <NotFoundPages
            message="Não encontramos nenhuma sala disponível no momento"
            href="/feed"
            page="Feed"
          />
        )}
      </div>
    </BaseLayout>
  );
}

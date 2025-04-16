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
      <div className="mt-2 grid w-full gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] justify-start">
        {rooms && rooms.results.length > 0 ? (
          rooms.results.map((room) => (
            <>
              <CardRoomContainer
                name={room.group_name}
                summary={room.summary}
                banner={room.banner}
                key={room.id}
                id={room.id}
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

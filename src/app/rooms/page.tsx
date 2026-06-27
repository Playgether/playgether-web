import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import RoomList from "@/components/pages/rooms/RoomList";
import { getChatRooms } from "@/services/getChatRooms";
import { getChatRoomsOccupancy } from "@/services/getChatRoomsOccupancy";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Playgether - Rooms",
  description: "Find people to chat with",
};

export default async function Room() {
  const rooms = await getChatRooms();

  const roomList = rooms?.results?.map((room) => ({
    id: room.id,
    slug: room.slug,
    name: room.group_name,
    summary: room.summary,
    banner: room.banner,
    capacity: room.capacity,
    peakUsers: room.peak_users,
    totalMessages: room.total_messages,
    isFavorited: room.is_favorited,
  })) ?? [];

  const initialOccupancy =
    roomList.length > 0
      ? await getChatRoomsOccupancy(roomList.map((room) => room.id))
      : {};

  return (
    <BaseLayout>
      <div className="min-h-layout-main bg-background pl-0 md:pl-20">
        <div className="mx-auto max-w-[88rem] p-4 md:p-6">
          <Suspense fallback={null}>
            <RoomList rooms={roomList} initialOccupancy={initialOccupancy} />
          </Suspense>
        </div>
      </div>
    </BaseLayout>
  );
}

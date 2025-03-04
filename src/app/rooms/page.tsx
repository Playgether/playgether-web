import BaseLayout from "@/components/layouts/BaseLayout";
import CardRoomContainer from "@/components/pages/rooms/CardRoomContainer";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Playgether - Rooms",
  description: "Find people to chat with",
};

export default async function Room() {
  return (
    <BaseLayout>
      <div className="text-black-300 max-w-[1420px] w-[90vw] h-full mt-2 flex flex-wrap gap-1 mb-4">
        <CardRoomContainer />
        <CardRoomContainer />
        <CardRoomContainer />
        <CardRoomContainer />
        <CardRoomContainer />
        <CardRoomContainer />
      </div>
    </BaseLayout>
  );
}

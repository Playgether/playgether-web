import React from "react";
import { ChatRoom } from "@/types/ChatRoom";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";

function RightChatRoomDescription({ room }: { room: ChatRoom }) {
  return (
    <div className="flex p-20 flex-col items-center justify-center">
      <div className="text-4xl">
        <span>{room.group_name}</span>
      </div>
      <div className="h-52 w-52 rounded-full relative overflow-hidden mt-4">
        <ImageComponent media_id={room.banner} width={400} />
      </div>
      <div className="mt-10 whitespace-pre-wrap">
        <p>{room.description}</p>
      </div>
    </div>
  );
}

export default RightChatRoomDescription;

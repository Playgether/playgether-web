import React from "react";
import HeaderChatRoom from "./HeaderChatRoom";
import SearchChat from "../../SearchChat";
import ChatRoomPeople from "./ChatRoomPeople";
import LeftRoomChatActions from "./LeftRoomChatActions";

async function LeftRoomChat({
  room_id,
  is_favorited,
}: {
  room_id: number;
  is_favorited: boolean;
}) {
  return (
    <div className="flex w-64 flex-col border-r LeftChat-wrapper min-h-0">
      <HeaderChatRoom />
      <SearchChat />
      <ChatRoomPeople />
      <LeftRoomChatActions room_id={room_id} is_favorited={is_favorited} />
    </div>
  );
}

export default LeftRoomChat;

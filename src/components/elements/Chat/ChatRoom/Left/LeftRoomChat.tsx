import React from "react";
import HeaderChatRoom from "./HeaderChatRoom";
import SearchChat from "../../SearchChat";
import ChatRoomPeople from "./ChatRoomPeople";
import LeftRoomChatActions from "./LeftRoomChatActions";

async function LeftRoomChat({
  room_slug,
  is_favorited,
}: {
  room_slug: string;
  is_favorited: boolean;
}) {
  return (
    <div className="flex w-64 flex-col border-r LeftChat-wrapper min-h-0">
      <HeaderChatRoom />
      <SearchChat />
      <ChatRoomPeople />
      <LeftRoomChatActions room_slug={room_slug} is_favorited={is_favorited} />
    </div>
  );
}

export default LeftRoomChat;

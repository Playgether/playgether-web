import React from "react";
import HeaderChatRoom from "./HeaderChatRoom";
import SearchChat from "../../SearchChat";
import ChatRoomPeople from "./ChatRoomPeople";
import LeftRoomChatActions from "./LeftRoomChatActions";

function LeftRoomChat() {
  return (
    <div className="flex w-64 flex-col border-r LeftChat-wrapper min-h-0">
      <HeaderChatRoom />
      <SearchChat />
      <ChatRoomPeople />
      <LeftRoomChatActions />
    </div>
  );
}

export default LeftRoomChat;

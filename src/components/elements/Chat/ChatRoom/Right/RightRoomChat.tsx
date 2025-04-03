"use client";
import React, { useState } from "react";
import RightChatRoomTop from "./RightChatRoomTop";
import ChatRoomNavigation from "./ChatNavigation";

async function RightRoomChat({ messages, room }) {
  const [rightChatActive, setRightChatActive] = useState("chat");

  const handleRightChatActive = (key: string) => {
    setRightChatActive(key);
  };

  const data = {
    key: rightChatActive,
    messages: messages,
    room: room,
  };
  return (
    <div className="flex-1 flex flex-col RightChat-wrapper min-h-[calc(100vh-160px)] overflow-auto">
      <RightChatRoomTop handleRightChatActive={handleRightChatActive} />
      <ChatRoomNavigation data={data} />
    </div>
  );
}

export default RightRoomChat;

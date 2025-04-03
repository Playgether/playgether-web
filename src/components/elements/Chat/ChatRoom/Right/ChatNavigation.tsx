import React from "react";
import RightChatWrapper from "./RightChatWrapper";
import RightChatRoomDescription from "./RightChatRoomDescription";
import RightChatRoomInformations from "./RightChatRoomInformations";
import { ChatRoomNavigationProps } from "@/types/ChatRoomNavigation";

function ChatRoomNavigation({ data }: { data: ChatRoomNavigationProps }) {
  const chatRoomNatigation = {
    chat: <RightChatWrapper messages={data.messages} />,
    description: <RightChatRoomDescription room={data.room} />,
    informations: <RightChatRoomInformations room={data.room} />,
  };
  return chatRoomNatigation[data.key];
}

export default ChatRoomNavigation;

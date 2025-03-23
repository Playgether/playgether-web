import React from "react";
import RightChatRoomTop from "./RightChatRoomTop";
import RightChatInputWrapper from "../../RightChatInputWrapper";
import RightChatRoomMessages from "./RightChatRoomMessages";
import { getRoomMessages } from "@/services/getRoomMessages";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import { cookies } from "next/headers";
import { ChatHandlerContextProvider } from "@/context/ChatHandlerContext";

async function RightRoomChat({
  group_name,
}: {
  group_name: string | undefined;
}) {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("access_token is undefined");
  }
  if (!group_name) {
    throw new Error("group_name is undefined");
  }

  const response = await getRoomMessages(group_name);
  const messages: ChatRoomMessages = response?.data?.results;

  return (
    <div className="flex-1 flex flex-col RightChat-wrapper min-h-0">
      <RightChatRoomTop />
      <ChatHandlerContextProvider token={accessToken} chatroom={group_name}>
        <RightChatRoomMessages
          group_name={group_name}
          messages={messages}
          token={accessToken}
        />
        <RightChatInputWrapper />
      </ChatHandlerContextProvider>
    </div>
  );
}

export default RightRoomChat;

"use client";
import React, { useEffect, useState } from "react";
import RightChatMineMessage from "../../RightChatMineMessage";
import RightChatRoomMessagesContainer from "./RightChatRoomMessagesContainer";
import RightChatRoomOnline from "./RightChatRoomOnline";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useAuthContext } from "@/context/AuthContext";
import NewMessage from "../../NewMessage";

function RightChatRoomMessages({
  token,
  group_name,
  messages,
}: {
  token: string;
  group_name: string;
  messages: ChatRoomMessages[];
}) {
  const [isLoading, setIsLoading] = useState(true);
  const { realTimeMessages, handleRealTimeMessages, newMessages } =
    useChatHandlerContext();
  const { user } = useAuthContext();

  useEffect(() => {
    if (messages && messages.length > 0) {
      handleRealTimeMessages(messages);
    }
    setIsLoading(false);
  }, [messages]);

  return (
    <>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <RightChatRoomOnline quantity="16 pessoas online agora" />
          <div className="p-4">
            {realTimeMessages && realTimeMessages.length > 0 ? (
              realTimeMessages.map((message) =>
                message?.author_username === user?.username ? (
                  <RightChatMineMessage
                    key={message.id}
                    message={message.body}
                    hour={message.created_at}
                  />
                ) : (
                  <RightChatRoomMessagesContainer
                    key={message.id}
                    image={message.author_profile_photo}
                    message={message.body}
                    hour={message.created_at}
                    name={message.author_name}
                  />
                )
              )
            ) : (
              <div className="flex-1 w-[98%] flex items-center justify-center flex-col">
                <span className="text-2xl">
                  Parece que ainda não há mensagens nesta sala...
                </span>
                <p>Seja o primeiro a enviar uma.</p>
              </div>
            )}
          </div>
          {newMessages.length > 0 && (
            <NewMessage quantity={newMessages.length} />
          )}
        </div>
      )}
    </>
  );
}

export default RightChatRoomMessages;

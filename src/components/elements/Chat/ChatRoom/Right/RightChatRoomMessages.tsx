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
import ScrollToBottom from "@/components/elements/ScrollToBottom/ScrollToBottom";
import ScrollToBottonIcon from "./ScrollToBottonIcon";

function RightChatRoomMessages({ messages }: { messages: ChatRoomMessages[] }) {
  const [isLoading, setIsLoading] = useState(true);
  const {
    realTimeMessages,
    handleRealTimeMessages,
    messagesDiv,
    resetMessagesQuantity,
    messagesQuantity,
    handleScroll,
    shouldScrollToBottom,
    executeScrollBottom,
    newMessageId,
  } = useChatHandlerContext();
  const { user } = useAuthContext();

  useEffect(() => {
    if (messages && messages.length > 0) {
      handleRealTimeMessages([...messages].reverse());
    }
    setIsLoading(false);
  }, [messages]);

  return (
    <>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div
          className="flex-1 overflow-y-auto space-y-4"
          onScroll={handleScroll}
          ref={messagesQuantity === 1 ? messagesDiv : null}
        >
          <RightChatRoomOnline quantity="16 pessoas online agora" />
          <div className="p-4 relative">
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
                    id={message.id}
                    key={message.id}
                    image={message.author_profile_photo}
                    message={message.body}
                    hour={message.created_at}
                    name={message.author_name}
                    newMessageId={newMessageId}
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
          {messagesQuantity > 0 ? (
            <NewMessage
              quantity={messagesQuantity}
              resetFunction={resetMessagesQuantity}
              shouldScrollToBottom={shouldScrollToBottom}
              newMessageId={newMessageId}
            />
          ) : (
            <>
              {!shouldScrollToBottom && (
                <ScrollToBottonIcon executeScrollBottom={executeScrollBottom} />
              )}
            </>
          )}
          <ScrollToBottom shouldScroll={shouldScrollToBottom} />
        </div>
      )}
    </>
  );
}

export default RightChatRoomMessages;

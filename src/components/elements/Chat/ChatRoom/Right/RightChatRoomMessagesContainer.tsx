"use client";
import React from "react";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";

function RightChatRoomMessagesContainer({
  image,
  message,
  hour,
  name,
  id,
  newMessageId,
}: {
  image: string;
  message: string;
  hour: Date;
  name: string;
  id: number;
  newMessageId: number;
}) {
  return (
    <>
      {newMessageId === id && (
        <div
          className="flex gap-1 h-fit items-center RightChatRoomMessagesContainer-new-messages"
          id={`${id}`}
        >
          <div className=" flex-1 h-1/2 RightChatRoomMessagesContainer-border"></div>
          <span>Novas mensagens</span>
          <div className=" flex-1 h-1/2 RightChatRoomMessagesContainer-border"></div>
        </div>
      )}
      <div className="flex mb-4 chat-message z-30">
        <ProfileImagePost
          username={"test"}
          link_photo={image}
          className={`h-10 w-10 mr-2`}
        />
        <div className="max-w-xs mt-1">
          <span>{name}</span>
          <div className="RightChatMessageContainer-wrapper p-3 whitespace-pre-wrap rounded-2xl rounded-bl-none w-fit">
            <p>{message}</p>
          </div>
          <p className="text-xs RightChatMessageContainer-hours mt-1 ">
            <DateAndHour date={hour} />
          </p>
        </div>
      </div>
    </>
  );
}

export default RightChatRoomMessagesContainer;

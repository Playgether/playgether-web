"use client";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import React from "react";

function ChatRoomPeople() {
  const { onlineUsers } = useChatHandlerContext();
  return (
    <div className="overflow-y-auto flex-1 ChatConversations-wrapper min-h-0">
      {onlineUsers.map((user, idx) => (
        <div
          key={idx}
          className="flex items-center p-3 ChatConversations-person cursor-pointer "
        >
          <div className="relative mr-3">
            <ProfileImagePost
              link_photo={user.profile_photo}
              username={user.username}
              className="h-10 w-10"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium truncate">{user.fullname}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatRoomPeople;

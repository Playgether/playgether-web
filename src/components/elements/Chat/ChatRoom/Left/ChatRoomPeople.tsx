"use client";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { RoomMemberIdentity } from "@/components/pages/rooms/RoomMemberIdentity";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import { useRoomPermissions } from "@/context/RoomPermissionsContext";
import React from "react";

function ChatRoomPeople({
  roomOwnerId,
}: {
  roomOwnerId?: string | number | null;
}) {
  const { onlineUsers } = useChatHandlerContext();
  const { snapshot } = useRoomPermissions();
  return (
    <div className="overflow-y-auto flex-1 ChatConversations-wrapper min-h-0">
      {onlineUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-start p-3 ChatConversations-person cursor-pointer "
        >
          <div className="relative mr-3 shrink-0">
            <ProfileImagePost
              link_photo={user.profile_photo}
              username={user.username}
              displayName={user.fullname}
              className="h-10 w-10"
            />
          </div>
          <div className="flex-1 min-w-0">
            <RoomMemberIdentity
              username={user.username}
              displayName={user.fullname}
              profilePhoto={user.profile_photo}
              userId={user.id}
              roomOwnerId={roomOwnerId}
              permissionsSnapshot={snapshot}
              highlightedAchievements={user.highlighted_achievements}
              showAvatar={false}
              nameClassName="font-medium truncate"
              roleClassName="truncate text-[10px] text-muted-foreground"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChatRoomPeople;

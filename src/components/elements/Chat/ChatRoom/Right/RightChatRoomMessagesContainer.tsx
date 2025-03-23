import React from "react";
import brazilianStrings from "react-timeago/lib/language-strings/pt-br";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import TimeAgo from "react-timeago";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";

function RightChatRoomMessagesContainer({
  image,
  message,
  hour,
  name,
}: {
  image: string;
  message: string;
  hour: Date;
  name: string;
}) {
  const formatter = buildFormatter(brazilianStrings);
  return (
    <div className="flex mb-4">
      <ProfileImagePost
        username={"test"}
        link_photo={image}
        className={`h-10 w-10 mr-2`}
      />
      <div className="max-w-xs mt-1">
        <span>{name}</span>
        <div className="RightChatMessageContainer-wrapper p-3 rounded-2xl rounded-bl-none w-fit">
          <p>{message}</p>
        </div>
        <p className="text-xs RightChatMessageContainer-hours mt-1 ">
          <TimeAgo date={hour} formatter={formatter} />
        </p>
      </div>
    </div>
  );
}

export default RightChatRoomMessagesContainer;

import React from "react";
import ProfileImagePost from "../../Middle/PostsComponents/ProfileImagePost/ProfileImagePost";

function NotificationsStructure({
  // title,
  // profile_photo,
  children,
  actors,
}: {
  // title: string;
  // profile_photo: string;
  actors: {};
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex justify-between">
      <div className=" flex items-center -gap-2">
        {actors.map((actor, index) => (
          <ProfileImagePost
            key={actor.id}
            username={actor.username}
            className={`h-8 w-8 ${
              index !== 0 ? "-ml-2 z-[${10 - index}]" : ""
            }}`}
          />
        ))}
      </div>
      {children}
    </div>
  );
}

export default NotificationsStructure;

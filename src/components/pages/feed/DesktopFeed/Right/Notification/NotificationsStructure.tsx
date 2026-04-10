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
  actors: any[];
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex justify-between">
      <div className=" flex items-center -gap-2">
        {actors.map((actor, index) => (
          <ProfileImagePost
            key={actor.username ?? actor.id ?? index}
            username={actor.username}
            displayName={actor.name}
            link_photo={actor.profile_photo}
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

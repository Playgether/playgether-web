import React from "react";
import { OnlineFriends } from "./OnlineFriends";
import { UserProfile } from "./UserProfile";
import avatarRaymond from "@/assets/avatar-raymond.jpg";
const currentUser = {
  name: "Raymond Junior",
  username: "raymond",
  bio: "Você não possui uma bio, insira uma.",
  avatar: avatarRaymond,
  followers: 1250,
  following: 894,
  posts: 156,
};

export default function LeftColumn() {
  return (
    <div className="col-span-3 space-y-6 sticky-container">
      <UserProfile user={currentUser} />
      <div className="sticky top-24">
        <OnlineFriends />
      </div>
    </div>
  );
}

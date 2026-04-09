"use client";

import React from "react";
import { OnlineFriends } from "./OnlineFriends";
import { UserProfile } from "./UserProfile";
import avatarRaymond from "@/assets/avatar-raymond.jpg";
import { useAuthContext } from "@/context/AuthContext";

export default function LeftColumn() {
  const { user } = useAuthContext();

  const display = user
    ? {
        name:
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
          user.username,
        username: user.username,
        bio: "Você não possui uma bio, insira uma.",
        avatar: avatarRaymond,
        followers: 0,
        following: 0,
        posts: 0,
      }
    : {
        name: "Visitante",
        username: "—",
        bio: "Faça login para ver seu perfil.",
        avatar: avatarRaymond,
        followers: 0,
        following: 0,
        posts: 0,
      };

  return (
    <div className="col-span-3 space-y-6 sticky-container">
      <UserProfile
        user={display}
        userId={user?.user_id != null ? Number(user.user_id) : undefined}
      />
      <div className="sticky top-24">
        <OnlineFriends />
      </div>
    </div>
  );
}

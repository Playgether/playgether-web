"use client";

import React, { useEffect } from "react";
import { OnlineFriends } from "./OnlineFriends";
import { UserProfile } from "./UserProfile";
import avatarRaymond from "@/assets/avatar-raymond.jpg";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { FeedLeftSidebarSkeleton } from "./FeedLeftSidebarSkeleton";

function parsePostsCount(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? n : 0;
}

export default function LeftColumn() {
  const { user, authSessionResolved } = useAuthContext();
  const { profile, fetchProfile } = useProfileContext();

  useEffect(() => {
    if (!user?.user_id) return;
    void fetchProfile();
  }, [user?.user_id, fetchProfile]);

  if (!authSessionResolved) {
    return <FeedLeftSidebarSkeleton />;
  }

  const display = user
    ? {
        name:
          `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
          user.username,
        username: user.username,
        bio:
          profile?.bio != null && String(profile.bio).trim() !== ""
            ? String(profile.bio)
            : "Você não possui uma bio, insira uma.",
        followers:
          profile && Array.isArray(profile.followed_by)
            ? profile.followed_by.length
            : 0,
        following:
          profile && Array.isArray(profile.follows) ? profile.follows.length : 0,
        posts: parsePostsCount(profile?.quantity_posts),
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
      <div className="space-y-6">
        <UserProfile
          user={display}
          userId={user?.user_id != null ? Number(user.user_id) : undefined}
          allowStatusPicker={Boolean(user?.user_id)}
          profilePhotoPublicId={
            user
              ? profile?.profile_photo?.trim()
                ? profile.profile_photo.trim()
                : null
              : undefined
          }
          guestAvatar={user ? undefined : avatarRaymond}
          profileDataPending={Boolean(user?.user_id) && profile === undefined}
        />
        <div className="sticky top-24">
          <OnlineFriends />
        </div>
      </div>
    </div>
  );
}

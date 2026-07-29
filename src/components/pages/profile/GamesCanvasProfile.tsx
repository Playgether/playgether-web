"use client";

import { useState } from "react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import { GamesCanvasUserProfile } from "./GamesCanvasUserProfile";
import { GamesCanvasContentTabs } from "./GamesCanvasContentTabs";
import { ProfilePostsProvider } from "@/app/profile/context/ProfilePostsContext";
import ProfileFeedServerComponentsProvider from "@/app/profile/context/ProfileFeedServerComponentsProvider";

export default function GamesCanvasProfile({
  profile: initialProfile,
  initialComments,
}: {
  profile: getProfileByUsernameProps | null;
  initialComments: ApiResponseComments;
}) {
  const [profile, setProfile] = useState<getProfileByUsernameProps | null>(
    initialProfile
  );

  const handleProfileUpdated = (updated: Partial<getProfileByUsernameProps>) => {
    setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
  };

  return (
    <div className="min-h-layout-main min-w-0 max-w-full bg-background layout-content-offset">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:py-4 xl:px-6 xl:py-6">
        <ProfileFeedServerComponentsProvider>
          <ProfilePostsProvider
            profileUsername={profile?.username}
            onPostAddedToCache={() =>
              handleProfileUpdated({
                quantity_posts: Number(profile?.quantity_posts || 0) + 1,
              })
            }
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-6">
              <div className="order-1 min-w-0 lg:order-2 lg:col-span-3">
                <GamesCanvasContentTabs
                  profile={profile}
                  initialComments={initialComments}
                  onProfileUpdated={handleProfileUpdated}
                />
              </div>

              <div className="order-2 hidden min-w-0 lg:order-1 lg:col-span-1 lg:block">
                <div className="lg:sticky lg:top-6">
                  <GamesCanvasUserProfile
                    profile={profile}
                    variant="full"
                    onProfileUpdated={handleProfileUpdated}
                  />
                </div>
              </div>
            </div>
          </ProfilePostsProvider>
        </ProfileFeedServerComponentsProvider>
      </div>
    </div>
  );
}

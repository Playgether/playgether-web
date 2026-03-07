"use client";

import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import { ApiResponseComments } from "@/context/CommentsContext";
import { GamesCanvasUserProfile } from "./GamesCanvasUserProfile";
import { GamesCanvasContentTabs } from "./GamesCanvasContentTabs";

export default function GamesCanvasProfile({
  profile,
  initialComments,
}: {
  profile: getProfileByUsernameProps | null;
  initialComments: ApiResponseComments;
}) {
  return (
    <div className="min-h-screen bg-background mb-[120px] pt-16 ml-0 md:ml-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="sticky top-6">
              <GamesCanvasUserProfile profile={profile} />
            </div>
          </div>

          <div className="lg:col-span-3 order-2 lg:order-2">
            <GamesCanvasContentTabs
              profile={profile}
              initialComments={initialComments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

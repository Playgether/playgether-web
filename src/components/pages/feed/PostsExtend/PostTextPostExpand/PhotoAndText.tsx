import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import React from "react";
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

function PhotoAndText({
  created_by_user_photo,
  created_by_user_name,
  timestamp,
  text,
  highlightedAchievements,
}: {
  created_by_user_photo: string;
  created_by_user_name: string;
  timestamp: Date;
  text: string;
  highlightedAchievements?: HighlightedAchievementPublic[];
}) {
  return (
    <>
      <ProfileAndUsername
        profile_photo={created_by_user_photo}
        username={created_by_user_name}
        timestamp={timestamp}
        imageClassName="mt-3 ml-3 h-10 w-10"
        usernameAndTimestampDiv="self-end"
        highlightedAchievements={highlightedAchievements}
      />
      <BorderLine />
      <div className="pt-4 pl-4 pb-4 overflow-y-auto">
        <p className="whitespace-pre-wrap">{text}</p>
      </div>
    </>
  );
}

export default PhotoAndText;

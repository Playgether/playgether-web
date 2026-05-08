import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import React from "react";
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

function PhotoAndText({
  created_by_user_photo,
  created_by_user_name,
  authorUsername,
  authorDisplayName,
  timestamp,
  text,
  highlightedAchievements,
}: {
  created_by_user_photo: string;
  created_by_user_name: string;
  /** @username para o link do perfil */
  authorUsername?: string;
  /** Nome completo para iniciais */
  authorDisplayName?: string;
  timestamp: Date;
  text: string;
  highlightedAchievements?: HighlightedAchievementPublic[];
}) {
  const displayName = authorDisplayName ?? created_by_user_name;
  const username = authorUsername ?? created_by_user_name;

  return (
    <>
      <ProfileAndUsername
        displayName={displayName}
        username={username}
        profile_photo={created_by_user_photo}
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

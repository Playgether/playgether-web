"use client";

import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import ProfileImagePost from "@/components/pages/feed/DesktopFeed/Middle/PostsComponents/ProfileImagePost/ProfileImagePost";
import { cn } from "@/lib/utils";
import { getRoomMemberRoleLabels } from "@/lib/roomMemberMeta";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";
import type { RoomPermissionsSnapshot } from "@/types/RoomPermissions";
import Link from "next/link";
import { useMemo, type ReactNode } from "react";

type RoomMemberIdentityProps = {
  username: string;
  displayName: string;
  profilePhoto?: string | null;
  userId?: string | number | null;
  roomOwnerId?: string | number | null;
  permissionsSnapshot?: RoomPermissionsSnapshot | null;
  highlightedAchievements?: HighlightedAchievementPublic[] | null;
  avatarClassName?: string;
  nameClassName?: string;
  roleClassName?: string;
  showAvatar?: boolean;
  showRole?: boolean;
  inlineRole?: boolean;
  linkProfile?: boolean;
  suffix?: ReactNode;
  className?: string;
};

export function RoomMemberIdentity({
  username,
  displayName,
  profilePhoto,
  userId,
  roomOwnerId,
  permissionsSnapshot,
  highlightedAchievements,
  avatarClassName = "h-8 w-8",
  nameClassName = "text-sm font-bold text-foreground",
  roleClassName = "text-[10px] text-muted-foreground",
  showAvatar = true,
  showRole = true,
  inlineRole = false,
  linkProfile = true,
  suffix,
  className,
}: RoomMemberIdentityProps) {
  const roleLabels = useMemo(
    () => getRoomMemberRoleLabels(userId, roomOwnerId, permissionsSnapshot),
    [userId, roomOwnerId, permissionsSnapshot],
  );

  const nameContent = (
    <span className={cn("whitespace-nowrap", nameClassName)}>{displayName}</span>
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-2", className)}>
      {showAvatar ? (
        <ProfileImagePost
          username={username}
          displayName={displayName}
          link_photo={profilePhoto ?? ""}
          className={cn("shrink-0 ring-1 ring-border", avatarClassName)}
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {linkProfile ? (
            <Link
              href={`/profile/${username}`}
              className="inline-flex min-w-0 max-w-full shrink-0 items-center hover:underline"
            >
              {nameContent}
            </Link>
          ) : (
            nameContent
          )}
          <HighlightedAchievementBadges
            achievements={highlightedAchievements}
            className="max-w-full"
            compact
            iconOnly
            max={3}
            showOverflowCounter={false}
          />
          {showRole && inlineRole && roleLabels.length > 0 ? (
            <span className={cn("shrink-0", roleClassName)}>
              · {roleLabels.join(" · ")}
            </span>
          ) : null}
          {suffix}
        </div>
        {showRole && !inlineRole && roleLabels.length > 0 ? (
          <p className={cn("truncate leading-tight", roleClassName)}>
            {roleLabels.join(" · ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

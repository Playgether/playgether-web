import { HTMLAttributes } from "react";
import UserNamePost from "../../pages/feed/DesktopFeed/MultUseComponents/UserNamePost/UserNamePost";
import { twJoin } from "tailwind-merge";
import DateAndHour from "../DateAndHour/DateAndHour";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

export interface ProfileAndUsernameProps extends HTMLAttributes<HTMLDivElement> {
  username: string;
  /** Nome exibido (geralmente nome completo) — usado nas iniciais quando não há foto. */
  displayName: string;
  profile_photo?: string | null;
  /** Tamanho, margens etc. Ex.: `mt-3 ml-3 h-10 w-10` ou `h-6 w-6`. */
  imageClassName?: string;
  timestamp?: Date;
  usernameAndTimestampDiv?: string;
  highlightedAchievements?: HighlightedAchievementPublic[] | null;
}

const ProfileAndUsername = ({
  username,
  displayName,
  profile_photo,
  imageClassName,
  timestamp,
  usernameAndTimestampDiv,
  highlightedAchievements,
  ...rest
}: ProfileAndUsernameProps) => {
  const profileHref = `/profile/${username}`;
  const compact = Boolean(
    imageClassName?.includes("h-6") || imageClassName?.includes("w-6"),
  );

  return (
    <div className={twJoin("", rest.className)} {...rest}>
      <div className="flex items-start gap-2 min-w-0">
        <Link
          href={profileHref}
          className={cn(
            "inline-flex shrink-0 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            imageClassName ?? "h-10 w-10",
          )}
        >
          <ProfileAvatar
            displayName={displayName}
            username={username}
            profilePhoto={profile_photo}
            sizeClass="h-full w-full"
            fallbackTextClassName={compact ? "text-xs" : "text-sm"}
          />
        </Link>
        <div
          className={twJoin("text-lg min-w-0 flex-1", usernameAndTimestampDiv)}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 [&_.UserNamePost-wrapper]:mt-0">
            <div className="inline-flex min-w-0 max-w-full shrink-0 items-center">
              <UserNamePost username={username} />
            </div>
            <HighlightedAchievementBadges
              achievements={highlightedAchievements}
              className="max-w-full"
              compact={compact}
              iconOnly
              max={compact ? 3 : 3}
              showOverflowCounter={false}
            />
          </div>
          {timestamp ? (
            <div className="ProfileAndUsername-wrapper text-sm">
              <DateAndHour date={timestamp} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileAndUsername;

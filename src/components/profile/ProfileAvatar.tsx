"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { Skeleton } from "@/components/ui/skeleton";
import { getProfileInitialsFromDisplayName } from "@/lib/profileInitials";

export function profilePhotoToAvatarSrc(
  profilePhoto: string | null | undefined,
): string | undefined {
  const s = profilePhoto?.trim();
  if (!s) return undefined;
  if (s.startsWith("http") || s.startsWith("/")) return s;
  return getCloudinaryUrl(s);
}

export type ProfileAvatarProps = {
  displayName: string;
  username?: string;
  profilePhoto?: string | null;
  className?: string;
  sizeClass?: string;
  ringClass?: string;
  fallbackTextClassName?: string;
  loading?: boolean;
  alt?: string;
};

export function ProfileAvatar({
  displayName,
  username,
  profilePhoto,
  className,
  sizeClass = "h-10 w-10",
  ringClass,
  fallbackTextClassName = "text-sm",
  loading = false,
  alt,
}: ProfileAvatarProps) {
  const initials = getProfileInitialsFromDisplayName(displayName, username);
  const src = profilePhotoToAvatarSrc(profilePhoto);

  if (loading) {
    return (
      <Skeleton
        className={cn("shrink-0 rounded-full", sizeClass, ringClass, className)}
      />
    );
  }

  return (
    <Avatar className={cn(sizeClass, ringClass, "shrink-0", className)}>
      {src ? (
        <AvatarImage src={src} alt={alt ?? displayName} className="object-cover" />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-gradient-primary font-semibold text-primary-foreground",
          fallbackTextClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

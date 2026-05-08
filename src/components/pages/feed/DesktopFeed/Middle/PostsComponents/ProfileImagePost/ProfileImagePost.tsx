import { twJoin } from "tailwind-merge";
import { HTMLAttributes } from "react";
import Link from "next/link";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

interface DivProps extends HTMLAttributes<HTMLDivElement> {}

export type Resource = {
  link_photo?: string | null;
  username?: string;
  /** Nome para iniciais; se omitido, usa `username`. */
  displayName?: string;
};

/**
 * Avatar de perfil com link para o perfil — usa `ProfileAvatar` (foto Cloudinary ou iniciais).
 */
const ProfileImagePost = ({
  link_photo,
  username,
  displayName,
  className,
  ...rest
}: Resource & DivProps) => {
  const profileHref = username ? `/profile/${username}` : "#";
  const label = (displayName ?? username ?? "?").trim() || "?";

  return (
    <div
      className={twJoin(
        "ProfilePhotoLink-wrapper rounded-full overflow-hidden",
        className,
      )}
      {...rest}
    >
      <Link
        href={profileHref}
        className="flex h-full w-full rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ProfileAvatar
          displayName={label}
          username={username}
          profilePhoto={link_photo}
          sizeClass="h-full w-full"
          fallbackTextClassName="text-sm"
        />
      </Link>
    </div>
  );
};

export default ProfileImagePost;

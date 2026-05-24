import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StaticImageData } from "next/image";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import TextLimitComponent from "@/components/layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";

interface UserProfileProps {
  user: {
    name: string;
    username: string;
    bio: string;
    followers: number;
    following: number;
    posts: number;
  };
  userId?: string | number;
  allowStatusPicker?: boolean;
  profilePhotoPublicId?: string | null;
  guestAvatar?: string | StaticImageData;
  profileDataPending?: boolean;
}

export const UserProfile = ({
  user,
  userId,
  allowStatusPicker = false,
  profilePhotoPublicId,
  guestAvatar,
  profileDataPending = false,
}: UserProfileProps) => {
  const isOwnerCard = userId != null;
  const guestPhotoSrc =
    typeof guestAvatar === "string"
      ? guestAvatar
      : guestAvatar?.src
        ? String(guestAvatar.src)
        : undefined;

  const profileHref =
    isOwnerCard && user.username && user.username !== "—"
      ? `/profile/${encodeURIComponent(user.username)}`
      : "/";

  return (
    <Card
      data-feed-user-profile-card
      className="bg-card border-border/50 backdrop-blur-sm hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 animate-fade-up"
    >
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative inline-block">
            {isOwnerCard ? (
              profileDataPending ? (
                <Skeleton className="h-20 w-20 rounded-full ring-4 ring-primary/30 shrink-0" />
              ) : (
                <ProfileAvatar
                  displayName={user.name}
                  username={user.username}
                  profilePhoto={profilePhotoPublicId}
                  sizeClass="h-20 w-20"
                  ringClass="ring-4 ring-primary/30"
                  fallbackTextClassName="text-xl"
                />
              )
            ) : (
              <ProfileAvatar
                displayName={user.name}
                username={user.username}
                profilePhoto={guestPhotoSrc}
                sizeClass="h-20 w-20"
                ringClass="ring-4 ring-primary/30"
                fallbackTextClassName="text-xl"
              />
            )}
            {userId != null ? (
              <PresenceStatusDot
                userId={userId}
                sizeClass="w-5 h-5"
                allowPicker={allowStatusPicker}
              />
            ) : null}
          </div>
        </div>

        <h3 className="font-bold text-xl text-foreground mb-1">{user.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">@{user.username}</p>

        {profileDataPending ? (
          <div className="mb-6 space-y-2">
            <Skeleton className="h-4 w-full mx-auto max-w-[280px]" />
            <Skeleton className="h-4 w-4/5 mx-auto max-w-[240px]" />
          </div>
        ) : (
          <TextLimitComponent
            text={user.bio}
            maxCharacters={40}
            className="mb-6"
            paragraphClassName="text-sm text-muted-foreground leading-relaxed text-center"
          />
        )}

        <Button
          asChild
          className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-medium transition-all duration-300 hover:scale-105 mb-6"
        >
          <Link href={profileHref}>Ver Perfil</Link>
        </Button>

        {profileDataPending ? (
          <div className="flex justify-between text-sm border-t border-border/50 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-1 flex-1">
                <Skeleton className="h-7 w-10 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between text-sm border-t border-border/50 pt-4">
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">
                {user.followers > 1000
                  ? `${(user.followers / 1000).toFixed(1)}K`
                  : user.followers}
              </div>
              <div className="text-xs text-muted-foreground">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">
                {user.following}
              </div>
              <div className="text-xs text-muted-foreground">Seguindo</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-foreground">
                {user.posts}
              </div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

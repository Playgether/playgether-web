import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StaticImageData } from "next/image";
import { PresenceStatusDot } from "@/components/presence/PresenceStatusDot";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import NoImageProfile from "@/components/general/NoImageProfile";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfileProps {
  user: {
    name: string;
    username: string;
    bio: string;
    followers: number;
    following: number;
    posts: number;
  };
  /** Quando definido, exibe bolinha de presença (ex.: usuário logado). */
  userId?: number;
  /** Card do próprio usuário: bolinha abre o seletor de status. */
  allowStatusPicker?: boolean;
  /**
   * Mesmo critério da página de perfil: `media_id` Cloudinary.
   * Se ausente/vazio → `NoImageProfile`.
   */
  profilePhotoPublicId?: string | null;
  /** Visitante: avatar estático (ex. placeholder). */
  guestAvatar?: string | StaticImageData;
  /** Perfil da API ainda não retornou (só para dono logado). */
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
  const photoRaw =
    typeof profilePhotoPublicId === "string"
      ? profilePhotoPublicId.trim()
      : "";
  const hasPhoto = photoRaw.length > 0;
  const useDirectUrl =
    photoRaw.startsWith("http") || photoRaw.startsWith("/");

  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 animate-fade-up">
      <CardContent className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative inline-block">
            {isOwnerCard ? (
              <div className="relative w-20 h-20 ring-4 ring-primary/30 rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-muted">
                {profileDataPending ? (
                  <Skeleton className="h-full w-full rounded-full" />
                ) : hasPhoto && useDirectUrl ? (
                  <img
                    src={photoRaw}
                    alt={user.name}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : hasPhoto ? (
                  <div className="relative h-full w-full">
                    <ImageComponent
                      media_id={photoRaw}
                      className="object-cover rounded-full"
                      alt={user.name}
                    />
                  </div>
                ) : (
                  <NoImageProfile
                    className="h-20 w-20 rounded-full"
                    iconClassName="w-10 h-10"
                  />
                )}
              </div>
            ) : (
              <Avatar className="w-20 h-20 ring-4 ring-primary/30">
                <AvatarImage
                  src={
                    typeof guestAvatar === "string"
                      ? guestAvatar
                      : guestAvatar?.src
                  }
                  alt={user.name}
                />
                <AvatarFallback className="bg-gradient-primary text-white font-bold text-xl">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
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
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {user.bio}
          </p>
        )}

        <Button className="w-full bg-gradient-primary hover:shadow-glow-primary text-white font-medium transition-all duration-300 hover:scale-105 mb-6">
          Ver Perfil
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

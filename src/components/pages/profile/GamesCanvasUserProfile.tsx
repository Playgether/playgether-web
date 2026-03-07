"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Settings, UserPlus } from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import NoImageProfile from "@/components/general/NoImageProfile";

export function GamesCanvasUserProfile({
  profile,
}: {
  profile: getProfileByUsernameProps | null;
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(profile?.quantity_likes ?? 0);
  const userRating = 4.5;

  const followersCount =
    (profile?.followed_by && Array.isArray(profile.followed_by)
      ? profile.followed_by.length
      : 0) ?? 0;
  const followingCount =
    (profile?.follows && Array.isArray(profile.follows)
      ? profile.follows.length
      : 0) ?? 0;

  const userStats = useMemo(
    () => [
      {
        label: "Seguidores",
        value: followersCount.toLocaleString(),
        color: "text-card-foreground",
      },
      {
        label: "Seguindo",
        value: followingCount.toLocaleString(),
        color: "text-card-foreground",
      },
      {
        label: "Posts",
        value: (profile?.quantity_posts ?? 0).toLocaleString(),
        color: "text-card-foreground",
      },
      {
        label: "Nível",
        value: (profile?.gamer_nivel ?? 0).toLocaleString(),
        color: "text-card-foreground",
      },
    ],
    [
      followersCount,
      followingCount,
      profile?.quantity_comment,
      profile?.gamer_nivel,
    ],
  );

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (rating <= 3.5)
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div className="w-full max-w-sm">
      <Card className="overflow-hidden bg-card border-border shadow-card">
        <div className="relative h-32 overflow-hidden">
          <img
            src={"/profile/profile1.jpg"}
            alt="Profile Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="relative px-6 pb-6">
            <div className="absolute -top-10 left-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-card shadow-neon rounded-full flex items-center justify-center">
                  {profile?.profile_photo ? (
                    <ImageComponent
                      media_id={profile?.profile_photo}
                      className="object-cover rounded-full h-20 w-20"
                    />
                  ) : (
                    <NoImageProfile
                      className="h-20 w-20"
                      iconClassName="w-10 h-10"
                    />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-neon-green rounded-full border-2 border-card" />
              </div>
            </div>

            <div className="pt-12 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-bold text-card-foreground">
                    {profile?.name || "—"}
                  </h1>
                  <Badge
                    variant="secondary"
                    className={`border-0 font-semibold ${getRatingColor(userRating)}`}
                  >
                    {userRating}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  @
                  {(profile?.username || "user")
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </p>
                <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap pt-4">
                  {profile?.bio || "Você não possui uma bio."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4">
                {userStats.map((stat, index) => (
                  <div key={index} className="text-center space-y-1">
                    <div className={`text-lg  ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    className={`flex-1 ${
                      isFollowing
                        ? "bg-secondary hover:bg-secondary/80"
                        : "bg-gradient-primary hover:shadow-neon transition-all duration-200 border-0"
                    }`}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className={`${
                      isLiked
                        ? "text-red-500 border-red-500/30 bg-red-500/10"
                        : "border-border text-muted-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                    } transition-all duration-200`}
                    onClick={handleLike}
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                    />
                    <span className="ml-1 text-xs">{likes}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-muted/20 px-6 py-3">
            <div className="flex justify-between text-center">
              <div className="flex-1">
                <div className="text-sm font-semibold text-neon-blue">
                  {profile?.performance || "85%"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

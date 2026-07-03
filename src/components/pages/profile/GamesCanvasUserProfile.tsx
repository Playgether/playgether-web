"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Settings, UserPlus } from "lucide-react";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useAuthContext } from "@/context/AuthContext";
import { ProfileEditModal } from "./modals/ProfileEditModal";
import { FollowListModal } from "./modals/FollowListModal";
import { followProfile } from "@/services/followProfile";
import { unfollowProfile } from "@/services/unfollowProfile";
import { postLike } from "@/services/postLike";
import { deleteLike } from "@/services/deleteLike";
import { LikeContentType } from "@/components/content_types/LikeContentType";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import { CustomToastProps } from "@/error/custom-toaster/enum";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { notifyFriendsListChanged } from "@/lib/friendsListEvents";
import { cn } from "@/lib/utils";
import { startConversation } from "@/services/directMessages";
import { useConversationsWidget } from "@/context/ConversationsWidgetContext";

const PROFILE_CARD_BIO_COLLAPSE_AFTER_CHARS = 200;
const PROFILE_CARD_BIO_COLLAPSE_AFTER_LINES = 5;

export function GamesCanvasUserProfile({
  profile,
  onProfileUpdated,
}: {
  profile: getProfileByUsernameProps | null;
  onProfileUpdated?: (updated: Partial<getProfileByUsernameProps>) => void;
}) {
  const { user, authSessionResolved } = useAuthContext();
  const { openWithConversation } = useConversationsWidget();
  const isOwner =
    !!user &&
    !!profile &&
    user.username.toLowerCase() === profile.username.toLowerCase();

  const [isFollowing, setIsFollowing] = useState(
    profile?.user_already_follow ?? false,
  );
  const [isLiked, setIsLiked] = useState(profile?.user_already_like ?? false);
  const [likes, setLikes] = useState(profile?.quantity_likes ?? 0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [followListModal, setFollowListModal] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    setBioExpanded(false);
  }, [profile?.username, profile?.bio]);

  useEffect(() => {
    if (profile) {
      setIsFollowing(profile.user_already_follow ?? false);
      setIsLiked(profile.user_already_like ?? false);
      setLikes(profile.quantity_likes ?? 0);
    }
  }, [
    profile?.user_already_follow,
    profile?.user_already_like,
    profile?.quantity_likes,
  ]);

  const userRating = 4.5;

  const excludeSelf = (list: unknown[]) =>
    list.filter((f) => f !== profile?.id).length;

  const [followersCount, setFollowersCount] = useState<number>(() =>
    profile?.followed_by && Array.isArray(profile.followed_by)
      ? excludeSelf(profile.followed_by)
      : 0,
  );

  const [followingCount, setFollowingCount] = useState<number>(() =>
    profile?.follows && Array.isArray(profile.follows)
      ? excludeSelf(profile.follows)
      : 0,
  );

  useEffect(() => {
    if (profile?.followed_by && Array.isArray(profile.followed_by)) {
      setFollowersCount(excludeSelf(profile.followed_by));
    }
  }, [profile?.followed_by]);

  useEffect(() => {
    if (profile?.follows && Array.isArray(profile.follows)) {
      setFollowingCount(excludeSelf(profile.follows));
    }
  }, [profile?.follows]);

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
      profile?.quantity_posts,
      profile?.gamer_nivel,
    ],
  );

  const handleFollowListChange = useCallback(
    ({
      type,
      action,
      userId,
    }: {
      type: "followers" | "following";
      action: "follow" | "unfollow";
      userId: number;
    }) => {
      if (!profile || !isOwner) return;

      if (type === "following") {
        const delta = action === "follow" ? 1 : -1;
        setFollowingCount((count) => Math.max(0, count + delta));
        onProfileUpdated?.({
          follows:
            action === "follow"
              ? ([...(profile.follows ?? []), userId] as [])
              : ((profile.follows ?? []).filter((id) => Number(id) !== userId) as []),
        });
      }
    },
    [isOwner, onProfileUpdated, profile],
  );

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (rating <= 3.5)
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-green-500 bg-green-500/10 border-green-500/20";
  };

  const handleFollow = async () => {
    if (!profile) return;
    const prevFollowing = isFollowing;
    const prevFollowers = followersCount;
    setIsFollowing(!prevFollowing);
    setFollowersCount((c) => (prevFollowing ? Math.max(0, c - 1) : c + 1));
    try {
      if (prevFollowing) {
        await unfollowProfile(profile.id);
        notifyFriendsListChanged();
        CustomToast.success("Você deixou de seguir este perfil!", {
          duration: CustomToastProps.defaultDuration,
        });
      } else {
        await followProfile(profile.id);
        notifyFriendsListChanged();
        CustomToast.success("Você passou a seguir este perfil!", {
          duration: CustomToastProps.defaultDuration,
        });
      }
    } catch (error: any) {
      setIsFollowing(prevFollowing);
      setFollowersCount(prevFollowers);
      CustomToast.error("Erro ao seguir", {
        description: (error as any)?.message ?? "Tente novamente mais tarde.",
        duration: CustomToastProps.defaultDuration,
      });
    }
  };

  const handleLike = async () => {
    if (!profile) return;
    const prevLiked = isLiked;
    const prevLikes = likes;
    setIsLiked(!prevLiked);
    setLikes(prevLiked ? Math.max(0, prevLikes - 1) : prevLikes + 1);
    try {
      if (prevLiked) {
        await deleteLike(profile.id, LikeContentType.profile);
      } else {
        await postLike({
          content_type: LikeContentType.profile,
          object_id: profile.id,
        });
      }
    } catch (error: any) {
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      CustomToast.error("Erro ao curtir", {
        description: error?.message ?? "Tente novamente mais tarde.",
        duration: CustomToastProps.defaultDuration,
      });
    }
  };

  const profileCardBioText = profile?.bio ?? "";
  const profileCardBioLineCount = profileCardBioText
    .replace(/\r\n/g, "\n")
    .split("\n").length;
  const profileCardBioNeedsToggle =
    profileCardBioText.length > PROFILE_CARD_BIO_COLLAPSE_AFTER_CHARS ||
    profileCardBioLineCount > PROFILE_CARD_BIO_COLLAPSE_AFTER_LINES;
  const likesLabel = new Intl.NumberFormat("pt-BR", {
    notation: likes >= 100000 ? "compact" : "standard",
    compactDisplay: "short",
    maximumFractionDigits: likes >= 100000 ? 1 : 0,
  }).format(likes);

  return (
    <>
      <CustomToaster />
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden bg-card border-border shadow-card">
          <div className="relative h-32 overflow-hidden bg-muted">
            {profile?.profile_banner ? (
              <div className="absolute inset-0">
                <ImageComponent
                  media_id={profile.profile_banner}
                  className="object-cover w-full h-full"
                  alt="Profile Banner"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
            )}
            <div className="absolute inset-0 bg-gradient-primary opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />

            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-card/80 backdrop-blur-md border border-border/50 text-card-foreground hover:bg-card hover:text-primary shadow-md"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>

          <CardContent className="p-0">
            <div className="relative px-6 pb-6">
              <div className="absolute -top-10 left-6">
                <div className="relative">
                  <ProfileAvatar
                    displayName={profile?.name ?? "?"}
                    username={profile?.username}
                    profilePhoto={profile?.profile_photo}
                    sizeClass="h-20 w-20"
                    className="border-4 border-card shadow-neon"
                    fallbackTextClassName="text-xl"
                  />
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
                  <div className="pt-2">
                    <HighlightedAchievementBadges
                      achievements={profile?.highlighted_achievements}
                    />
                  </div>
                  <div className="pt-4 space-y-1">
                    <p
                      className={cn(
                        "text-sm text-card-foreground leading-relaxed whitespace-pre-wrap",
                        !bioExpanded &&
                          profileCardBioNeedsToggle &&
                          "max-h-[6.5rem] overflow-hidden",
                      )}
                    >
                      {profileCardBioText}
                    </p>
                    {profileCardBioNeedsToggle ? (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={() => setBioExpanded((v) => !v)}
                      >
                        {bioExpanded ? "Ver menos" : "Ver mais"}
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4">
                  {userStats.map((stat, index) => {
                    const isClickable = stat.label === "Seguidores" || stat.label === "Seguindo";
                    const modalType = stat.label === "Seguidores" ? "followers" : "following";
                    return (
                      <div
                        key={index}
                        className={`text-center space-y-1 ${isClickable ? "cursor-pointer rounded-lg p-1 hover:bg-muted/50 transition-colors" : ""}`}
                        onClick={isClickable ? () => setFollowListModal(modalType) : undefined}
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onKeyDown={isClickable ? (e) => { if (e.key === "Enter") setFollowListModal(modalType); } : undefined}
                      >
                        <div className={`text-lg transition-all duration-300 ${stat.color}`}>
                          {stat.value}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wide">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isOwner}
                    onClick={!isOwner ? handleLike : undefined}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
                      isOwner
                        ? "cursor-default border-border bg-muted/40 text-card-foreground opacity-100"
                        : isLiked
                          ? "text-red-500 border-red-500/30 bg-red-500/10 hover:bg-red-500/15"
                          : "border-border text-card-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                    }`}
                    title={`${likes.toLocaleString("pt-BR")} curtidas`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isLiked ? "fill-current text-red-500" : "text-red-500"}`}
                    />
                    <span className="font-medium">{likesLabel} curtidas</span>
                  </Button>
                </div>

                {authSessionResolved && !isOwner && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant={isFollowing ? "secondary" : "default"}
                        size="sm"
                        className={`flex-1 min-w-0 ${
                          isFollowing
                            ? "bg-secondary hover:bg-secondary/80"
                            : "bg-gradient-primary hover:shadow-neon transition-all duration-200 border-0"
                        }`}
                        onClick={handleFollow}
                      >
                        <UserPlus className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">{isFollowing ? "Seguindo" : "Seguir"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-0 border-border hover:bg-primary/10 hover:border-primary/40"
                        onClick={async () => {
                          if (!profile?.user_id) return;
                          const conv = await startConversation(String(profile.user_id));
                          if (conv) openWithConversation(conv.id);
                        }}
                      >
                        <MessageCircle className="h-4 w-4 mr-1 shrink-0" />
                        <span className="truncate">Mensagem</span>
                      </Button>
                    </div>
                  </div>
                )}
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

      {profile && followListModal && (
        <FollowListModal
          open={!!followListModal}
          onOpenChange={(open) => { if (!open) setFollowListModal(null); }}
          profileId={profile.id}
          type={followListModal}
          isOwnProfile={isOwner}
          onListChange={handleFollowListChange}
        />
      )}

      {onProfileUpdated && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onProfileUpdated={onProfileUpdated}
          onWidgetOpenChange={() => {}}
        />
      )}
    </>
  );
}

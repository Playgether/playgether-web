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
  variant = "full",
  embedded = false,
}: {
  profile: getProfileByUsernameProps | null;
  onProfileUpdated?: (updated: Partial<getProfileByUsernameProps>) => void;
  variant?: "full" | "compact";
  embedded?: boolean;
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

  const modals = (
    <>
      {profile && followListModal && (
        <FollowListModal
          open={!!followListModal}
          onOpenChange={(open) => {
            if (!open) setFollowListModal(null);
          }}
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

  if (variant === "compact") {
    const statShortLabels: Record<string, string> = {
      Seguidores: "Seg.",
      Seguindo: "Segu.",
      Posts: "Posts",
      Nível: "Nív.",
    };

    const compactBody = embedded ? (
      <>
        <div className="relative h-5 overflow-hidden bg-muted">
          {profile?.profile_banner ? (
            <div className="absolute inset-0">
              <ImageComponent
                media_id={profile.profile_banner}
                className="h-full w-full object-cover"
                alt="Profile Banner"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/25 via-primary/10 to-primary/25" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>

        <div className="px-2.5 pb-2 pt-0">
          <div className="flex items-center gap-2">
            <ProfileAvatar
              displayName={profile?.name ?? "?"}
              username={profile?.username}
              profilePhoto={profile?.profile_photo}
              sizeClass="h-9 w-9 shrink-0"
              className="mt-0.5 border-2 border-card shadow-neon"
              fallbackTextClassName="text-xs"
            />
            <div className="min-w-0 flex flex-1 items-start justify-between gap-1">
              <div className="min-w-0">
                <h1 className="truncate text-[13px] font-bold leading-tight text-card-foreground">
                  {profile?.name || "—"}
                </h1>
                <p className="truncate text-[10px] leading-tight text-muted-foreground">
                  @
                  {(profile?.username || "user")
                    .toLowerCase()
                    .replace(/\s+/g, "")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {/* Nota do perfil — desativada temporariamente
                <Badge
                  variant="secondary"
                  className={`border-0 px-1 py-0 text-[9px] font-semibold leading-none ${getRatingColor(userRating)}`}
                >
                  {userRating}
                </Badge>
                */}
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 border-0 bg-card/70 text-card-foreground shadow-none backdrop-blur-sm hover:bg-card hover:text-primary"
                    onClick={() => setIsEditModalOpen(true)}
                    title="Editar perfil"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                )}
                {authSessionResolved && !isOwner && (
                  <>
                    <Button
                      variant={isFollowing ? "secondary" : "default"}
                      size="icon"
                      className={cn(
                        "h-6 w-6",
                        !isFollowing && "border-0 bg-gradient-primary",
                      )}
                      onClick={handleFollow}
                      title={isFollowing ? "Seguindo" : "Seguir"}
                    >
                      <UserPlus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 border-border"
                      onClick={async () => {
                        if (!profile?.user_id) return;
                        const conv = await startConversation(
                          String(profile.user_id),
                        );
                        if (conv) openWithConversation(conv.id);
                      }}
                      title="Mensagem"
                    >
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="mt-1 pl-11">
            <HighlightedAchievementBadges
              achievements={profile?.highlighted_achievements}
            />
          </div>

          <div
            className={cn(
              "mt-1.5 flex items-stretch divide-x divide-border/50 border border-border/40 bg-muted/20",
              embedded ? "rounded-none" : "rounded-md",
            )}
          >
            {userStats.map((stat, index) => {
              const isClickable =
                stat.label === "Seguidores" || stat.label === "Seguindo";
              const modalType =
                stat.label === "Seguidores" ? "followers" : "following";
              return (
                <div
                  key={index}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center py-1",
                    isClickable &&
                      "cursor-pointer transition-colors hover:bg-muted/40",
                  )}
                  onClick={
                    isClickable
                      ? () => setFollowListModal(modalType)
                      : undefined
                  }
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === "Enter") setFollowListModal(modalType);
                        }
                      : undefined
                  }
                >
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums leading-none",
                      stat.color,
                    )}
                  >
                    {stat.value}
                  </span>
                  <span className="mt-0.5 text-[7px] uppercase leading-none text-muted-foreground">
                    {statShortLabels[stat.label] ?? stat.label}
                  </span>
                </div>
              );
            })}
            <button
              type="button"
              disabled={isOwner}
              onClick={!isOwner ? handleLike : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-1 transition-colors",
                !isOwner && "hover:bg-muted/40",
                isOwner && "cursor-default",
                isLiked && !isOwner && "text-red-500",
              )}
              title={`${likes.toLocaleString("pt-BR")} curtidas`}
            >
              <Heart
                className={cn(
                  "h-3 w-3",
                  isLiked && !isOwner && "fill-current text-red-500",
                )}
              />
              <span className="mt-0.5 text-[7px] uppercase leading-none text-muted-foreground">
                {likesLabel}
              </span>
            </button>
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="relative h-12 overflow-hidden bg-muted sm:h-14">
          {profile?.profile_banner ? (
            <div className="absolute inset-0">
              <ImageComponent
                media_id={profile.profile_banner}
                className="h-full w-full object-cover"
                alt="Profile Banner"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 border border-border/50 bg-card/80 text-card-foreground shadow-md backdrop-blur-md hover:bg-card hover:text-primary"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <div className="px-3 pb-3 pt-0">
          <div className="flex gap-2.5">
            <ProfileAvatar
              displayName={profile?.name ?? "?"}
              username={profile?.username}
              profilePhoto={profile?.profile_photo}
              sizeClass="h-12 w-12 shrink-0"
              className="-mt-6 border-[3px] border-card shadow-neon"
              fallbackTextClassName="text-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0">
                  <h1 className="truncate text-sm font-bold text-card-foreground">
                    {profile?.name || "—"}
                  </h1>
                  <p className="truncate text-[11px] text-muted-foreground">
                    @
                    {(profile?.username || "user")
                      .toLowerCase()
                      .replace(/\s+/g, "")}
                  </p>
                </div>
                {/* Nota do perfil — desativada temporariamente
                <Badge
                  variant="secondary"
                  className={`shrink-0 border-0 px-1.5 py-0 text-[10px] font-semibold ${getRatingColor(userRating)}`}
                >
                  {userRating}
                </Badge>
                */}
              </div>
              <div className="mt-1">
                <HighlightedAchievementBadges
                  achievements={profile?.highlighted_achievements}
                />
              </div>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-4 gap-0.5">
            {userStats.map((stat, index) => {
              const isClickable =
                stat.label === "Seguidores" || stat.label === "Seguindo";
              const modalType =
                stat.label === "Seguidores" ? "followers" : "following";
              return (
                <div
                  key={index}
                  className={cn(
                    "space-y-0.5 text-center",
                    isClickable &&
                      "cursor-pointer rounded-md p-0.5 transition-colors hover:bg-muted/50",
                  )}
                  onClick={
                    isClickable
                      ? () => setFollowListModal(modalType)
                      : undefined
                  }
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === "Enter") setFollowListModal(modalType);
                        }
                      : undefined
                  }
                >
                  <div
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      stat.color,
                    )}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[8px] uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isOwner}
              onClick={!isOwner ? handleLike : undefined}
              className={cn(
                "h-7 rounded-full px-2 text-[11px]",
                isOwner
                  ? "cursor-default border-border bg-muted/40 opacity-100"
                  : isLiked
                    ? "border-red-500/30 bg-red-500/10 text-red-500"
                    : "border-border text-card-foreground",
              )}
            >
              <Heart
                className={cn(
                  "mr-0.5 h-3 w-3",
                  isLiked ? "fill-current text-red-500" : "text-red-500",
                )}
              />
              {likesLabel}
            </Button>

            {authSessionResolved && !isOwner && (
              <>
                <Button
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                  className={cn(
                    "h-7 flex-1 text-[11px]",
                    !isFollowing &&
                      "border-0 bg-gradient-primary hover:shadow-neon",
                  )}
                  onClick={handleFollow}
                >
                  <UserPlus className="mr-0.5 h-3 w-3 shrink-0" />
                  {isFollowing ? "Seguindo" : "Seguir"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 flex-1 border-border text-[11px] hover:border-primary/40 hover:bg-primary/10"
                  onClick={async () => {
                    if (!profile?.user_id) return;
                    const conv = await startConversation(String(profile.user_id));
                    if (conv) openWithConversation(conv.id);
                  }}
                >
                  <MessageCircle className="mr-0.5 h-3 w-3 shrink-0" />
                  Msg
                </Button>
              </>
            )}
          </div>
        </div>
      </>
    );

    if (embedded) {
      return (
        <>
          {compactBody}
          {modals}
        </>
      );
    }

    return (
      <>
        <CustomToaster />
        <Card className="overflow-hidden border-border bg-card shadow-card">
          {compactBody}
        </Card>
        {modals}
      </>
    );
  }

  return (
    <>
      <CustomToaster />
      <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-sm">
        <Card className="overflow-hidden border-border bg-card shadow-card">
          <div className="relative h-24 overflow-hidden bg-muted sm:h-28 lg:h-32">
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
            <div className="relative px-4 pb-4 lg:px-6 lg:pb-6">
              <div className="absolute -top-8 left-4 lg:-top-10 lg:left-6">
                <div className="relative">
                  <ProfileAvatar
                    displayName={profile?.name ?? "?"}
                    username={profile?.username}
                    profilePhoto={profile?.profile_photo}
                    sizeClass="h-16 w-16 lg:h-20 lg:w-20"
                    className="border-4 border-card shadow-neon"
                    fallbackTextClassName="text-lg lg:text-xl"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-10 lg:pt-12">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2 lg:items-center">
                    <h1 className="min-w-0 text-lg font-bold text-card-foreground lg:text-xl">
                      {profile?.name || "—"}
                    </h1>
                    {/* Nota do perfil — desativada temporariamente
                    <Badge
                      variant="secondary"
                      className={`border-0 font-semibold ${getRatingColor(userRating)}`}
                    >
                      {userRating}
                    </Badge>
                    */}
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

                <div className="grid grid-cols-4 gap-2 py-3 lg:grid-cols-2 lg:gap-3 lg:py-4">
                  {userStats.map((stat, index) => {
                    const isClickable = stat.label === "Seguidores" || stat.label === "Seguindo";
                    const modalType = stat.label === "Seguidores" ? "followers" : "following";
                    return (
                      <div
                        key={index}
                        className={`space-y-0.5 text-center lg:space-y-1 ${isClickable ? "cursor-pointer rounded-lg p-1 transition-colors hover:bg-muted/50" : ""}`}
                        onClick={isClickable ? () => setFollowListModal(modalType) : undefined}
                        role={isClickable ? "button" : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onKeyDown={isClickable ? (e) => { if (e.key === "Enter") setFollowListModal(modalType); } : undefined}
                      >
                        <div className={`text-base transition-all duration-300 lg:text-lg ${stat.color}`}>
                          {stat.value}
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground lg:text-xs">
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

            <div className="border-t border-border bg-muted/20 px-4 py-3 lg:px-6">
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

      {modals}
    </>
  );
}

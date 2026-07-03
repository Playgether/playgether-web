"use client";

import { useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { followProfile } from "@/services/followProfile";
import { unfollowProfile } from "@/services/unfollowProfile";
import { CustomToast } from "@/components/ui/customSonner";
import { useFeedContext } from "../context/FeedContext";
import { useProfileContext } from "@/context/ProfileContext";
import type { PostProps } from "../types/PostProps";

interface FeedPostFollowButtonProps {
  post: PostProps;
}

export function FeedPostFollowButton({ post }: FeedPostFollowButtonProps) {
  const { feedMode, handleAuthorFollow } = useFeedContext();
  const { fetchProfile } = useProfileContext();
  const [isFollowing, setIsFollowing] = useState(
    post.user_already_follow ?? false,
  );
  const [isLoading, setIsLoading] = useState(false);

  const isOwnPost = post.is_own || post.isOwn;

  if (feedMode !== "explore" || isOwnPost) {
    return null;
  }

  const handleToggleFollow = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) return;

    const wasFollowing = isFollowing;
    const nextFollowing = !wasFollowing;

    setIsFollowing(nextFollowing);
    handleAuthorFollow(post.id, nextFollowing);
    setIsLoading(true);

    try {
      if (wasFollowing) {
        await unfollowProfile(post.username);
        void fetchProfile();
        CustomToast.success("Você deixou de seguir este usuário.");
      } else {
        await followProfile(post.username);
        void fetchProfile();
        CustomToast.success("Você começou a seguir este usuário.");
      }
    } catch {
      setIsFollowing(wasFollowing);
      handleAuthorFollow(post.id, wasFollowing);
      CustomToast.error(
        wasFollowing
          ? "Não foi possível deixar de seguir este usuário."
          : "Não foi possível seguir este usuário.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const label = isFollowing ? "Seguindo" : "Seguir";

  return (
    <Button
      type="button"
      size="sm"
      variant={isFollowing ? "secondary" : "outline"}
      onClick={(event) => void handleToggleFollow(event)}
      title={label}
      aria-label={label}
      className={cn(
        "pointer-events-auto h-8 shrink-0 p-0 text-xs font-semibold lg:gap-1.5 lg:px-2.5",
        isFollowing
          ? "w-8 text-muted-foreground hover:bg-secondary/80 lg:w-auto"
          : "w-8 border-primary/40 text-primary hover:bg-primary/10 lg:w-auto",
      )}
    >
      {isFollowing ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      <span className="hidden lg:inline">{label}</span>
    </Button>
  );
}

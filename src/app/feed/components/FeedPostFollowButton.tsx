"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { followProfile } from "@/services/followProfile";
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

  if (feedMode !== "explore" || isOwnPost || isFollowing) {
    return null;
  }

  const handleFollow = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);
    try {
      await followProfile(post.username);
      setIsFollowing(true);
      handleAuthorFollow(post.id);
      void fetchProfile();
      CustomToast.success("Você começou a seguir este jogador.");
    } catch {
      CustomToast.error("Não foi possível seguir este jogador.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={isLoading}
      onClick={(event) => void handleFollow(event)}
      className="pointer-events-auto h-8 shrink-0 gap-1.5 border-primary/40 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
    >
      <UserPlus className="h-3.5 w-3.5" />
      Seguir
    </Button>
  );
}

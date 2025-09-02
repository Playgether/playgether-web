"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { useFeedContext } from "../context/FeedContext";
import { PostProps } from "../types/PostProps";

export default function PostActions({
  post,
  handleShareModal,
}: {
  post: PostProps;
  handleShareModal: (action: boolean) => void;
}) {
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerFeedPost.icons;
  const { handleLike } = useFeedContext();
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLike(post.id)}
        className={cn(
          "flex items-center space-x-2 transition-all duration-300",
          post.user_already_like
            ? "text-red-500 hover:text-red-600 animate-heart-burst"
            : "text-muted-foreground hover:text-red-500"
        )}
      >
        <Heart
          className={cn("w-5 h-5", post.user_already_like && "fill-current")}
        />
        <span className="font-medium">{post.quantity_likes}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-2 text-muted-foreground hover:text-neon-blue transition-colors"
      >
        {icons.MessageCircle}
        <span className="font-medium">{post.quantity_comment}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShareModal(true)}
        className="flex items-center space-x-2 text-muted-foreground hover:text-neon-green transition-colors"
      >
        {icons.Share2}
        <span className="font-medium">{post.quantity_reposts}</span>
      </Button>
    </>
  );
}

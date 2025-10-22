"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { useFeedContext } from "../context/FeedContext";
import { PostProps } from "../types/PostProps";
import { LikeContentType } from "@/components/content_types/LikeContentType";
import { PostPropertiers } from "@/components/layouts/components/PostsPropertiersQuantity";

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
  const onClickLike = () => {
    handleLike(post.id);
  };
  return (
    <>
      {/* <Button
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
      </Button> */}
      <PostPropertiers.Root className="">
        <PostPropertiers.Like
          quantity_likes={post.quantity_likes}
          user_already_like={post.user_already_like}
          object_id={post.id}
          content_type={LikeContentType.post}
          onAddLike={onClickLike}
          onDeleteLike={onClickLike}
        />
        <PostPropertiers.Comment quantity_comment={post.quantity_comment} />
        <PostPropertiers.Share quantity_reposts={post.quantity_reposts} />
      </PostPropertiers.Root>
    </>
  );
}

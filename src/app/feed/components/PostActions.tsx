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
  handleShareModal: () => void;
}) {
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerFeedPost.icons;
  const { handleLike } = useFeedContext();
  const onClickLike = () => {
    handleLike(post.id);
  };
  return (
    <>
      <PostPropertiers.Root className="">
        <PostPropertiers.Like
          quantitylikesNumber={post.quantity_likes}
          clicked={post.user_already_like}
          object_id={post.id}
          content_type={LikeContentType.post}
          onAddLike={onClickLike}
          onDeleteLike={onClickLike}
        />
        <PostPropertiers.Comment quantity_comment={post.quantity_comment} />
        <PostPropertiers.Share
          quantity_reposts={post.quantity_reposts}
          onClickShare={() => handleShareModal()}
        />
      </PostPropertiers.Root>
    </>
  );
}

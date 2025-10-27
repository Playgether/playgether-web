"use client";
import { PostModal } from "@/app/feed/components/PostModal";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import React from "react";

function ClientPostModal({ postId }: { postId?: number }) {
  const { posts } = useFeedContext();
  const postIdNum = Number(postId);
  const post = Number.isNaN(postIdNum)
    ? undefined
    : posts.find((p) => p.id === postIdNum);
  return post && <PostModal post={post} />;
}

export default ClientPostModal;

import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { CommentsContextProvider } from "@/context/CommentsContext";
import { getCommentsServer } from "@/services/getCommentsServer";
import { PostPageClient } from "./PostPageClient";
import type { PostProps } from "@/app/feed/types/PostProps";

async function fetchPost(id: number): Promise<PostProps | null> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const res = await api.get(`/api/v1/posts/${id}/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data as PostProps;
  } catch {
    return null;
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) notFound();

  const [post, initialComments] = await Promise.all([
    fetchPost(postId),
    getCommentsServer(postId),
  ]);

  if (!post) notFound();

  // feed/layout.tsx already provides FeedServerComponentsProvider + FeedProvider.
  // We only need to inject the post into context and provide comments.
  return (
    <BaseLayout>
      <CommentsContextProvider response={initialComments} postId={postId}>
        <PostPageClient postId={postId} post={post} />
      </CommentsContextProvider>
    </BaseLayout>
  );
}

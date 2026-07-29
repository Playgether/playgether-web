import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import BaseLayout from "@/app/base-layout/components/structure/BaseLayout";
import { GuestPostLayout } from "@/app/feed/[id]/GuestPostLayout";
import { CommentsContextProvider } from "@/context/CommentsContext";
import { getCommentsServer } from "@/services/getCommentsServer";
import { optionalAuthHeaders } from "@/lib/optionalAuthHeaders";
import { PostPageClient } from "./PostPageClient";
import type { PostProps } from "@/app/feed/types/PostProps";

async function fetchPost(id: number): Promise<PostProps | null> {
  try {
    const headers = await optionalAuthHeaders();
    const res = await api.get(`/api/v1/posts/${id}/`, {
      ...(headers ? { headers } : {}),
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

  const cookieStore = await cookies();
  const isGuest = !cookieStore.get("refreshToken")?.value;

  const [post, initialComments] = await Promise.all([
    fetchPost(postId),
    getCommentsServer(postId),
  ]);

  if (!post) notFound();

  const content = (
    <CommentsContextProvider response={initialComments} postId={postId}>
      <PostPageClient postId={postId} post={post} isGuest={isGuest} />
    </CommentsContextProvider>
  );

  // Guest shared-link: slim chrome (logo + Entrar). Auth users keep full app chrome.
  if (isGuest) {
    return <GuestPostLayout>{content}</GuestPostLayout>;
  }

  return <BaseLayout>{content}</BaseLayout>;
}

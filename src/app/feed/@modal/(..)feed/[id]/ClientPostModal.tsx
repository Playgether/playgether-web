"use client";
import { PostModal } from "@/app/feed/components/PostModal";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/services/apiFetch";
import type { PostProps } from "@/app/feed/types/PostProps";
import React from "react";

function ClientPostModalInner({ postId }: { postId?: string }) {
  const { getPostById, injectPost } = useFeedContext();
  const [ready, setReady] = useState(false);

  const postInContext = postId ? getPostById(postId) : undefined;

  useEffect(() => {
    if (!postId) return;

    if (getPostById(postId)) {
      setReady(true);
      return;
    }

    // Post not in feed context — fetch from API and inject
    apiFetch(`/api/posts/${postId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) return;
        return res.json() as Promise<PostProps>;
      })
      .then((post) => {
        if (post) {
          injectPost(post);
          setReady(true);
        }
      })
      .catch(() => setReady(false));
  }, [postId, injectPost]);

  // Re-check after inject
  useEffect(() => {
    if (postInContext) setReady(true);
  }, [postInContext]);

  if (!ready || !postInContext) return null;

  return <PostModal postId={postInContext.id} />;
}

function ClientPostModal({ postId }: { postId?: string }) {
  return (
    <Suspense fallback={null}>
      <ClientPostModalInner postId={postId} />
    </Suspense>
  );
}

export default ClientPostModal;

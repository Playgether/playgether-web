"use client";
import { PostModal } from "@/app/feed/components/PostModal";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import { Suspense, useEffect, useState } from "react";
import { apiFetch } from "@/services/apiFetch";
import type { PostProps } from "@/app/feed/types/PostProps";
import React from "react";

function ClientPostModalInner({ postId }: { postId?: number }) {
  const { getPostById, injectPost } = useFeedContext();
  const postIdNum = Number(postId);
  const [ready, setReady] = useState(false);

  const postInContext = Number.isNaN(postIdNum) ? undefined : getPostById(postIdNum);

  useEffect(() => {
    if (!postIdNum || Number.isNaN(postIdNum)) return;

    if (getPostById(postIdNum)) {
      setReady(true);
      return;
    }

    // Post not in feed context — fetch from API and inject
    apiFetch(`/api/posts/${postIdNum}`, { credentials: "include" })
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
  }, [postIdNum, injectPost]);

  // Re-check after inject
  useEffect(() => {
    if (postInContext) setReady(true);
  }, [postInContext]);

  if (!ready || !postInContext) return null;

  return <PostModal postId={postInContext.id} />;
}

function ClientPostModal({ postId }: { postId?: number }) {
  return (
    <Suspense fallback={null}>
      <ClientPostModalInner postId={postId} />
    </Suspense>
  );
}

export default ClientPostModal;

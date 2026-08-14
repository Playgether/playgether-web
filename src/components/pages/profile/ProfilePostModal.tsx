"use client";

import { Suspense, useEffect, useState } from "react";
import { PostModal } from "@/app/feed/components/PostModal";
import { CommentsContextProvider } from "@/context/CommentsContext";
import { getCommentsClient } from "@/services/getComments";
import type { ApiResponseComments } from "@/context/CommentsContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { useFeedContext } from "@/app/feed/context/FeedContext";
import { apiFetch } from "@/services/apiFetch";
import type { PostProps } from "@/app/feed/types/PostProps";

interface ProfilePostModalProps {
  postId: number | null;
  open: boolean;
  onClose: () => void;
}

export function ProfilePostModal({
  postId,
  open,
  onClose,
}: ProfilePostModalProps) {
  const { getPostById, injectPost } = useFeedContext();
  const [commentsResponse, setCommentsResponse] =
    useState<ApiResponseComments | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isResolvingPost, setIsResolvingPost] = useState(false);
  const [resolveFailed, setResolveFailed] = useState(false);
  const postInContext = postId != null ? getPostById(postId) : undefined;

  useEffect(() => {
    if (!postId || !open) {
      setIsResolvingPost(false);
      setResolveFailed(false);
      return;
    }
    if (getPostById(postId)) {
      setIsResolvingPost(false);
      setResolveFailed(false);
      return;
    }

    let cancelled = false;
    setIsResolvingPost(true);
    setResolveFailed(false);
    apiFetch(`/api/posts/${postId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<PostProps>;
      })
      .then((post) => {
        if (cancelled) return;
        if (post) {
          injectPost(post);
          setResolveFailed(false);
        } else {
          setResolveFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setResolveFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsResolvingPost(false);
      });

    return () => {
      cancelled = true;
    };
    // omit getPostById to avoid refetch loops when inject updates context
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, open, injectPost]);

  useEffect(() => {
    if (!postId || !open) {
      setCommentsResponse(null);
      return;
    }
    setIsLoadingComments(true);
    getCommentsClient(postId, null)
      .then((res) => {
        setCommentsResponse({
          data: res.data ?? [],
          next_page: res.next_page ?? null,
        });
      })
      .catch(() => {
        setCommentsResponse({ data: [], next_page: null });
      })
      .finally(() => {
        setIsLoadingComments(false);
      });
  }, [postId, open]);

  useEffect(() => {
    if (resolveFailed) onClose();
  }, [resolveFailed, onClose]);

  if (!open || !postId || resolveFailed) return null;

  if (
    isLoadingComments ||
    isResolvingPost ||
    !commentsResponse ||
    !postInContext
  ) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingComponent showText={false} className="h-8 w-8" />
      </div>
    );
  }

  return (
    <CommentsContextProvider response={commentsResponse} postId={postId}>
      <Suspense fallback={null}>
        <PostModal postId={postId} onClose={onClose} />
      </Suspense>
    </CommentsContextProvider>
  );
}

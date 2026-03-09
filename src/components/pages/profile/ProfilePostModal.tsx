"use client";

import { useEffect, useState } from "react";
import { PostModal } from "@/app/feed/components/PostModal";
import { CommentsContextProvider } from "@/context/CommentsContext";
import { getCommentsClient } from "@/services/getComments";
import type { ApiResponseComments } from "@/context/CommentsContext";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

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
  const [commentsResponse, setCommentsResponse] =
    useState<ApiResponseComments | null>(null);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

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

  if (!open || !postId) return null;

  if (isLoadingComments || !commentsResponse) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingComponent showText={false} className="h-8 w-8" />
      </div>
    );
  }

  return (
    <CommentsContextProvider response={commentsResponse} postId={postId}>
      <PostModal postId={postId} onClose={onClose} />
    </CommentsContextProvider>
  );
}

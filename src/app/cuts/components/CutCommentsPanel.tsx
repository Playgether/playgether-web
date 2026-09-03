"use client";

import { memo, useCallback, useEffect, useMemo, useState, useRef } from "react";
import { X, Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { Cut } from "@/types/Cut";
import { getCloudinaryUrl } from "@/app/utils/getCloudinaryUrl";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import {
  EmojiPickerButton,
  useEmojiInsert,
} from "@/components/emoji/EmojiPickerButton";
import { MentionText } from "@/components/mentions/MentionText";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { CommentActionMenu } from "@/app/feed/components/CommentActionMenu";
import { CommentContentType } from "@/components/content_types/CommentContentType";
import { useAuthContext } from "@/context/AuthContext";
import { deleteCommentAction } from "@/actions/deleteComment";
import { updateCommentAction } from "@/actions/updateComment";
import type { PostsCommentsProps } from "@/services/getComments";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CustomToast } from "@/components/ui/customSonner";

interface CutComment {
  id: string;
  comment: string;
  user: number;
  timestamp: string;
  user_username?: string;
  created_by_user_photo?: string | null;
  highlighted_achievements?: HighlightedAchievementPublic[];
  quantity_comment?: number;
  is_pinned?: boolean;
  is_hidden?: boolean;
  answers?: {
    results: CutComment[];
    next?: string | null;
    previous?: string | null;
  };
}

interface CutCommentsPanelProps {
  cut: Cut;
  isAuthenticated?: boolean;
  onClose: () => void;
  variant: "side" | "sheet";
  onCommentsCountChange?: (cutId: string, delta: number) => void;
}

interface CutCommentsResponse {
  results: CutComment[];
  next: string | null;
  previous?: string | null;
}

function normalizeResponse(data: unknown): CutCommentsResponse {
  if (Array.isArray(data)) {
    return { results: data as CutComment[], next: null, previous: null };
  }

  const payload = data as { results?: unknown; next?: unknown; previous?: unknown };
  return {
    results: Array.isArray(payload?.results) ? (payload.results as CutComment[]) : [],
    next: typeof payload?.next === "string" ? payload.next : null,
    previous: typeof payload?.previous === "string" ? payload.previous : null,
  };
}

function toPostsCommentsProps(comment: CutComment): PostsCommentsProps {
  return {
    id: comment.id,
    comment: comment.comment,
    user_username: comment.user_username ?? "",
    created_by_user_name: comment.user_username ?? "",
    created_by_user_photo: comment.created_by_user_photo ?? "",
    timestamp: new Date(comment.timestamp),
    user: comment.user,
    quantity_comment: comment.quantity_comment ?? 0,
    is_pinned: comment.is_pinned,
    is_hidden: comment.is_hidden,
    highlighted_achievements: comment.highlighted_achievements,
    answers: { next: "", previous: "", results: [] },
    user_already_like: false,
    object_id: "",
    quantity_likes: 0,
    content_type: CommentContentType.cut,
    edited: false,
    quantity_replies: comment.quantity_comment ?? 0,
  };
}

export function CutCommentsPanel({
  cut,
  isAuthenticated,
  onClose,
  variant,
  onCommentsCountChange,
}: CutCommentsPanelProps) {
  const { user } = useAuthContext();
  const currentUsername = user?.username;
  const [commentsDisabled, setCommentsDisabled] = useState(cut.comments_disabled);
  const canComment = cut.can_comment !== false && !commentsDisabled;
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{
    comment: CutComment;
    parentId?: string;
  } | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [replyTextByComment, setReplyTextByComment] = useState<Record<string, string>>({});
  const [replyComposerOpenByComment, setReplyComposerOpenByComment] = useState<Record<string, boolean>>({});
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [loadingRepliesByComment, setLoadingRepliesByComment] = useState<Record<string, boolean>>({});
  const [loadingMoreRepliesByComment, setLoadingMoreRepliesByComment] = useState<Record<string, boolean>>({});
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => ["cut-comments", cut.id], [cut.id]);
  const cached = queryClient.getQueryData(queryKey);

  const {
    data,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery<CutCommentsResponse>({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const cursor = typeof pageParam === "string" ? pageParam : null;
      const url = cursor ? `/api/cuts/${cut.id}/comments?cursor=${encodeURIComponent(cursor)}` : `/api/cuts/${cut.id}/comments`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Erro ao carregar comentários");
      }
      const json = await response.json();
      return normalizeResponse(json);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) return undefined;
      try {
        const parsed = new URL(lastPage.next);
        return parsed.searchParams.get("cursor") ?? undefined;
      } catch {
        return undefined;
      }
    },
    initialPageParam: null,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 2,
  });

  const comments = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.results),
    [data],
  );

  const loadingInitial = comments.length === 0 && (isFetching || !cached);

  useEffect(() => {
    setCommentsDisabled(cut.comments_disabled);
  }, [cut.comments_disabled, cut.id]);

  const removeCommentFromCache = useCallback(
    (commentId: string, parentId?: string) => {
      queryClient.setQueryData(
        queryKey,
        (old: { pages: CutCommentsResponse[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          if (parentId) {
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                results: page.results.map((comment) =>
                  comment.id === parentId
                    ? {
                        ...comment,
                        quantity_comment: Math.max(0, (comment.quantity_comment ?? 1) - 1),
                        answers: {
                          results: (comment.answers?.results ?? []).filter(
                            (reply) => reply.id !== commentId,
                          ),
                          next: comment.answers?.next ?? null,
                          previous: comment.answers?.previous ?? null,
                        },
                      }
                    : comment,
                ),
              })),
            };
          }
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.filter((comment) => comment.id !== commentId),
            })),
          };
        },
      );
    },
    [queryClient, queryKey],
  );

  const handleCommentUpdate = useCallback(
    (commentId: string, parentId: string | undefined, updated: PostsCommentsProps) => {
      const patch = (comment: CutComment): CutComment => ({
        ...comment,
        comment: updated.comment,
        is_pinned: updated.is_pinned,
        is_hidden: updated.is_hidden,
      });

      queryClient.setQueryData(
        queryKey,
        (old: { pages: CutCommentsResponse[]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              results: page.results.map((comment) => {
                if (!parentId && comment.id === commentId) {
                  return patch(comment);
                }
                if (parentId && comment.id === parentId) {
                  return {
                    ...comment,
                    answers: {
                      results: (comment.answers?.results ?? []).map((reply) =>
                        reply.id === commentId ? patch(reply) : reply,
                      ),
                      next: comment.answers?.next ?? null,
                      previous: comment.answers?.previous ?? null,
                    },
                  };
                }
                return comment;
              }),
            })),
          };
        },
      );
    },
    [queryClient, queryKey],
  );

  const handleEditComment = useCallback((comment: CutComment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.comment);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditingContent("");
  }, []);

  const handleSaveEdit = useCallback(
    async (comment: CutComment, parentId?: string) => {
      if (!editingContent.trim()) return;
      setIsUpdatingComment(true);
      try {
        const response = await updateCommentAction({
          comment_id: comment.id,
          comment: editingContent,
          content_type: parentId ? CommentContentType.comment : CommentContentType.cut,
          object_id: parentId ?? cut.id,
        });
        handleCommentUpdate(comment.id, parentId, {
          ...toPostsCommentsProps(comment),
          ...response,
          comment: editingContent,
        });
        setEditingCommentId(null);
        setEditingContent("");
      } catch {
        CustomToast.error("Erro ao editar comentário.");
      } finally {
        setIsUpdatingComment(false);
      }
    },
    [cut.id, editingContent, handleCommentUpdate],
  );

  const handleDeleteRequest = useCallback((comment: CutComment, parentId?: string) => {
    setCommentToDelete({ comment, parentId });
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!commentToDelete) return;
    setIsDeletingComment(true);
    try {
      await deleteCommentAction(commentToDelete.comment.id);
      removeCommentFromCache(commentToDelete.comment.id, commentToDelete.parentId);
      if (!commentToDelete.parentId) {
        onCommentsCountChange?.(cut.id, -1);
      }
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
      CustomToast.success("Comentário excluído.");
    } catch {
      CustomToast.error("Erro ao excluir comentário.");
    } finally {
      setIsDeletingComment(false);
    }
  }, [commentToDelete, cut.id, onCommentsCountChange, removeCommentFromCache]);

  const updateCommentInCache = (
    commentId: string,
    updater: (comment: CutComment) => CutComment,
  ) => {
    queryClient.setQueryData(
      queryKey,
      (old: { pages: CutCommentsResponse[]; pageParams: unknown[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            results: page.results.map((comment) =>
              comment.id === commentId ? updater(comment) : comment,
            ),
          })),
        };
      },
    );
  };

  async function fetchReplies(commentId: string, cursor?: string | null) {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
    const response = await fetch(`/api/replies/${commentId}${query}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Erro ao carregar respostas");
    }
    const data = await response.json() as {
      data?: CutComment[];
      next_page?: string | null;
      previous_page?: string | null;
    };
    return {
      results: Array.isArray(data.data) ? data.data : [],
      next: typeof data.next_page === "string" ? data.next_page : null,
      previous: typeof data.previous_page === "string" ? data.previous_page : null,
    };
  }

  const handleToggleReplies = async (comment: CutComment) => {
    const isExpanded = !!expandedReplies[comment.id];
    if (isExpanded) {
      setExpandedReplies((prev) => ({ ...prev, [comment.id]: false }));
      return;
    }

    setExpandedReplies((prev) => ({ ...prev, [comment.id]: true }));
    const hasLoadedReplies = (comment.answers?.results?.length ?? 0) > 0;
    const hasReplies = (comment.quantity_comment ?? 0) > 0;
    if (hasLoadedReplies || !hasReplies) return;

    setLoadingRepliesByComment((prev) => ({ ...prev, [comment.id]: true }));
    try {
      const replies = await fetchReplies(comment.id);
      updateCommentInCache(comment.id, (current) => ({
        ...current,
        answers: {
          results: replies.results,
          next: replies.next,
          previous: replies.previous,
        },
      }));
    } catch {
      // ignore
    } finally {
      setLoadingRepliesByComment((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  const handleLoadMoreReplies = async (comment: CutComment) => {
    const nextUrl = comment.answers?.next ?? null;
    if (!nextUrl) return;
    let cursor: string | null = null;
    try {
      cursor = new URL(nextUrl).searchParams.get("cursor");
    } catch {
      cursor = null;
    }
    if (!cursor) return;

    setLoadingMoreRepliesByComment((prev) => ({ ...prev, [comment.id]: true }));
    try {
      const replies = await fetchReplies(comment.id, cursor);
      updateCommentInCache(comment.id, (current) => ({
        ...current,
        answers: {
          results: [...(current.answers?.results ?? []), ...replies.results],
          next: replies.next,
          previous: replies.previous,
        },
      }));
    } catch {
      // ignore
    } finally {
      setLoadingMoreRepliesByComment((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  const handleSendReply = async (commentId: string) => {
    const content = (replyTextByComment[commentId] ?? "").trim();
    if (!isAuthenticated || !content || !canComment) return;
    setReplyingCommentId(commentId);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: content,
          content_type: "comment",
          object_id: commentId,
        }),
      });
      if (!response.ok) return;
      const newReply = await response.json() as CutComment;
      updateCommentInCache(commentId, (current) => ({
        ...current,
        quantity_comment: (current.quantity_comment ?? 0) + 1,
        answers: {
          results: [newReply, ...(current.answers?.results ?? [])],
          next: current.answers?.next ?? null,
          previous: current.answers?.previous ?? null,
        },
      }));
      setExpandedReplies((prev) => ({ ...prev, [commentId]: true }));
      setReplyTextByComment((prev) => ({ ...prev, [commentId]: "" }));
    } catch {
      // ignore
    } finally {
      setReplyingCommentId(null);
    }
  };

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const target = loadMoreRef.current;
    const root = listScrollRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fetchNextPage().catch(() => {});
          }
        });
      },
      { root, threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleCreateComment = useCallback(async (content: string) => {
    if (!isAuthenticated || !canComment) return false;
    try {
      const res = await fetch(`/api/cuts/${cut.id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: content }),
      });
      if (res.ok) {
        const newComment = await res.json();
        queryClient.setQueryData(
          queryKey,
          (old: { pages: CutCommentsResponse[]; pageParams: unknown[] } | undefined) => {
            if (!old || old.pages.length === 0) {
              return {
                pages: [{ results: [newComment], next: null, previous: null }],
                pageParams: [null],
              };
            }

            const firstPage = old.pages[0];
            return {
              ...old,
              pages: [
                { ...firstPage, results: [newComment, ...firstPage.results] },
                ...old.pages.slice(1),
              ],
            };
          },
        );
        onCommentsCountChange?.(cut.id, 1);
        return true;
      }
    } catch {
      // ignore
    }
    return false;
  }, [canComment, cut.id, isAuthenticated, onCommentsCountChange, queryClient, queryKey]);

  const body = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        {variant === "sheet" ? (
          <DrawerTitle className="text-sm font-semibold text-white">
            Comentários · {cut.comments_count}
          </DrawerTitle>
        ) : (
          <span className="text-sm font-semibold text-white">
            Comentários · {cut.comments_count}
          </span>
        )}
        <button type="button" onClick={onClose} aria-label="Fechar">
          <X className="h-5 w-5 text-white/70 hover:text-white" />
        </button>
      </div>

      <div ref={listScrollRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {loadingInitial ? (
          <div className="flex justify-center pt-8">
            <CommentsSkeleton />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-white/40 pt-8">Nenhum comentário ainda.</p>
        ) : (
          <>
            {comments.map((c) => (
              <div key={c.id} className="space-y-2">
                <CommentRow
                  comment={c}
                  cutOwnerUsername={cut.username}
                  currentUsername={currentUsername}
                  editingCommentId={editingCommentId}
                  editingContent={editingContent}
                  isUpdatingComment={isUpdatingComment}
                  onEditingContentChange={setEditingContent}
                  onEdit={() => handleEditComment(c)}
                  onDelete={() => handleDeleteRequest(c)}
                  onCommentUpdate={(updated) => handleCommentUpdate(c.id, undefined, updated)}
                  onSaveEdit={() => void handleSaveEdit(c)}
                  onCancelEdit={handleCancelEdit}
                />

                <div className="ml-11 flex items-center gap-4 text-xs text-white/60">
                  {(c.quantity_comment ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleToggleReplies(c)}
                      className="hover:text-white"
                    >
                      {expandedReplies[c.id] ? "Ocultar respostas" : "Ver respostas"}
                      {` (${c.quantity_comment})`}
                    </button>
                  )}
                  {isAuthenticated && canComment && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedReplies((prev) => ({ ...prev, [c.id]: true }));
                        setReplyComposerOpenByComment((prev) => ({ ...prev, [c.id]: true }));
                      }}
                      className="hover:text-white"
                    >
                      Responder
                    </button>
                  )}
                </div>

                {expandedReplies[c.id] && (
                  <div className="ml-11 space-y-3">
                    {isAuthenticated && canComment && replyComposerOpenByComment[c.id] && (
                      <ReplyComposer
                        value={replyTextByComment[c.id] ?? ""}
                        onChange={(value) =>
                          setReplyTextByComment((prev) => ({ ...prev, [c.id]: value }))
                        }
                        onSubmit={() => void handleSendReply(c.id)}
                        sending={replyingCommentId === c.id}
                      />
                    )}

                    {loadingRepliesByComment[c.id] ? (
                      <RepliesSkeleton />
                    ) : (c.answers?.results?.length ?? 0) === 0 ? (
                      <p className="text-xs text-white/40">Nenhuma resposta ainda.</p>
                    ) : (
                      <>
                        {c.answers?.results?.map((reply) => (
                          <CommentRow
                            key={reply.id}
                            comment={reply}
                            compact
                            cutOwnerUsername={cut.username}
                            currentUsername={currentUsername}
                            editingCommentId={editingCommentId}
                            editingContent={editingContent}
                            isUpdatingComment={isUpdatingComment}
                            onEditingContentChange={setEditingContent}
                            onEdit={() => handleEditComment(reply)}
                            onDelete={() => handleDeleteRequest(reply, c.id)}
                            onCommentUpdate={(updated) =>
                              handleCommentUpdate(reply.id, c.id, updated)
                            }
                            onSaveEdit={() => void handleSaveEdit(reply, c.id)}
                            onCancelEdit={handleCancelEdit}
                          />
                        ))}
                        {c.answers?.next && (
                          <button
                            type="button"
                            onClick={() => void handleLoadMoreReplies(c)}
                            className="text-xs text-primary hover:underline disabled:opacity-50"
                            disabled={!!loadingMoreRepliesByComment[c.id]}
                          >
                            {loadingMoreRepliesByComment[c.id]
                              ? "Carregando respostas..."
                              : "Ver mais respostas"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {hasNextPage && <div ref={loadMoreRef} className="h-1 w-full" />}
            {hasNextPage && !isFetchingNextPage && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchNextPage().catch(() => {});
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Carregar mais comentários
                </button>
              </div>
            )}
            {isFetchingNextPage && (
              <div className="pt-2">
                <CommentsSkeleton count={2} />
              </div>
            )}
          </>
        )}
      </div>

      {commentsDisabled ? (
        <div className="border-t border-white/10 px-4 py-3 text-center text-sm text-white/50">
          Comentários desativados pelo autor.
        </div>
      ) : !canComment ? (
        <div className="border-t border-white/10 px-4 py-3 text-center text-sm text-white/50">
          Você não tem permissão para comentar nesta publicação.
        </div>
      ) : isAuthenticated ? (
        <NewCommentComposer onSubmit={handleCreateComment} />
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border border-border/50 bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingComment}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleConfirmDelete()}
              disabled={isDeletingComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingComment ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  if (variant === "side") {
    return (
      <div className="flex h-full w-full flex-col border-l border-white/10 bg-zinc-950">
        {body}
      </div>
    );
  }

  return (
    <Drawer open onOpenChange={(next) => { if (!next) onClose(); }}>
      <DrawerContent className="flex h-[80dvh] flex-col border-white/10 bg-zinc-950 text-white">
        {body}
      </DrawerContent>
    </Drawer>
  );
}

function CommentsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex gap-3 animate-pulse">
          <div className="h-8 w-8 shrink-0 rounded-full bg-white/15" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-white/15" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-3/4 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RepliesSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div key={idx} className="flex gap-3 animate-pulse">
          <div className="h-7 w-7 shrink-0 rounded-full bg-white/15" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-white/15" />
            <div className="h-3 w-5/6 rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

const CommentRow = memo(function CommentRow({
  comment,
  compact = false,
  cutOwnerUsername,
  currentUsername,
  editingCommentId,
  editingContent,
  isUpdatingComment,
  onEditingContentChange,
  onEdit,
  onDelete,
  onCommentUpdate,
  onSaveEdit,
  onCancelEdit,
}: {
  comment: CutComment;
  compact?: boolean;
  cutOwnerUsername: string;
  currentUsername?: string;
  editingCommentId: string | null;
  editingContent: string;
  isUpdatingComment: boolean;
  onEditingContentChange: (value: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCommentUpdate: (updated: PostsCommentsProps) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const avatarSrc = comment.created_by_user_photo ? getCloudinaryUrl(comment.created_by_user_photo) : null;
  const menuComment = toPostsCommentsProps(comment);
  const isEditing = editingCommentId === comment.id;

  return (
    <div className="flex gap-3">
      <span className={`flex shrink-0 overflow-hidden rounded-full bg-white/10 ${compact ? "h-7 w-7" : "h-8 w-8"}`}>
        {avatarSrc ? (
          <Image src={avatarSrc} alt="" width={32} height={32} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-xs font-bold text-white">
            {comment.user_username?.[0]?.toUpperCase() ?? "?"}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="shrink-0 text-xs font-semibold text-white/80">
              @{comment.user_username ?? "user"}
            </span>
            <HighlightedAchievementBadges
              achievements={comment.highlighted_achievements}
              className="max-w-full"
              compact
              iconOnly
              max={3}
              showOverflowCounter={false}
            />
            {comment.is_pinned ? (
              <span className="shrink-0 text-[10px] font-medium text-primary">Fixado</span>
            ) : null}
            {comment.is_hidden && cutOwnerUsername === currentUsername ? (
              <span className="shrink-0 text-[10px] text-white/40">Oculto</span>
            ) : null}
          </div>
          <CommentActionMenu
            comment={menuComment}
            postOwnerUsername={cutOwnerUsername}
            currentUsername={currentUsername}
            onEdit={onEdit}
            onDelete={onDelete}
            onCommentUpdate={onCommentUpdate}
            isReply={compact}
            triggerClassName="h-7 w-7 shrink-0 text-white/60 hover:bg-white/10 hover:text-white"
          />
        </div>
        {isEditing ? (
          <div className="mt-1 space-y-2">
            <MentionTextarea
              value={editingContent}
              onChange={onEditingContentChange}
              rows={2}
              dropdownSide="top"
              className="min-h-0 w-full resize-none rounded-lg border-0 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={isUpdatingComment}
                onClick={onSaveEdit}
                className="h-8"
              >
                {isUpdatingComment ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isUpdatingComment}
                onClick={onCancelEdit}
                className="h-8 text-white/70 hover:text-white"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className={`${compact ? "text-xs" : "text-sm"} text-white/90`}>
            <MentionText text={comment.comment} />
          </p>
        )}
      </div>
    </div>
  );
});

function ReplyComposer({
  value,
  onChange,
  onSubmit,
  sending,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const { insertEmoji, syncSelection, restoreFocus } = useEmojiInsert(inputRef, value, onChange);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <EmojiPickerButton
          open={emojiOpen}
          onOpenChange={setEmojiOpen}
          onBeforeOpen={syncSelection}
          onPick={insertEmoji}
          onClosed={restoreFocus}
          disabled={sending}
          buttonClassName="text-white/70 hover:text-white hover:bg-white/10"
          panelClassName="bg-zinc-900"
        />
        <MentionTextarea
          ref={inputRef}
          value={value}
          onChange={onChange}
          onSelect={syncSelection}
          onClick={syncSelection}
          onKeyUp={syncSelection}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Responder comentário…"
          rows={1}
          dropdownSide="top"
          className="min-h-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 resize-none border-0"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || sending}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
          aria-label="Enviar resposta"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function NewCommentComposer({ onSubmit }: { onSubmit: (content: string) => Promise<boolean> }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { insertEmoji, syncSelection, restoreFocus } = useEmojiInsert(inputRef, text, setText);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    try {
      const ok = await onSubmit(content);
      if (ok) {
        setText("");
        setEmojiOpen(false);
      }
    } finally {
      setSending(false);
    }
  }, [onSubmit, text]);

  return (
    <div className="flex flex-col gap-2 border-t border-white/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <EmojiPickerButton
          open={emojiOpen}
          onOpenChange={setEmojiOpen}
          onBeforeOpen={syncSelection}
          onPick={insertEmoji}
          onClosed={restoreFocus}
          disabled={sending}
          buttonClassName="text-white/70 hover:text-white hover:bg-white/10"
          panelClassName="bg-zinc-900"
        />
        <MentionTextarea
          ref={inputRef}
          value={text}
          onChange={setText}
          onSelect={syncSelection}
          onClick={syncSelection}
          onKeyUp={syncSelection}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
          placeholder="Adicionar comentário…"
          rows={1}
          dropdownSide="top"
          className="min-h-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-0 resize-none border-0"
        />
        <button
          type="button"
          onClick={() => void handleSend()}
          disabled={!text.trim() || sending}
          aria-label="Enviar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

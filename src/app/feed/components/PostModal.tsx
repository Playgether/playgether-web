"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFeedServerContext } from "../context/FeedServerContext";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import VideoComponent from "@/components/layouts/VideoComponent/VideoComponent";
import { useRouter, useSearchParams } from "next/navigation";
import { useCommentsContext } from "@/context/CommentsContext";
import { Virtuoso } from "react-virtuoso";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { PostPropertiers } from "@/components/layouts/components/PostsPropertiersQuantity";
import { LikeContentType } from "@/components/content_types/LikeContentType";
import { useFeedContext } from "../context/FeedContext";
import { ShareModal } from "./ShareModal";
import { postComment } from "@/services/postComment";
import { useAuthContext } from "@/context/AuthContext";
import { DeleteCommentModal } from "../@modal/(..)feed/components/DeleteCommentModal";
import { deleteCommentAction } from "@/actions/deleteComment";
import { PostsCommentsProps } from "@/services/getComments";
import { useQueryClient } from "@tanstack/react-query";
import { MentionTextarea } from "@/components/mentions/MentionTextarea";
import {
  EmojiPickerButton,
  useEmojiInsert,
} from "@/components/emoji/EmojiPickerButton";
import { MentionText } from "@/components/mentions/MentionText";
import { updateCommentAction } from "@/actions/updateComment";
import { CommentContentType } from "@/components/content_types/CommentContentType";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { handleKeyDown } from "@/components/layouts/SendOnEnterKey/sendOnEnterKey";
import { CommentActionMenu } from "./CommentActionMenu";
import ContextMenuNotMine from "./ContextMenuNotMine";
import ContextMenuOwn from "./ContextMenuOwn";
import ContextMenuAction from "./ContextMenuAction";
import { PostPageRecommendations } from "@/app/feed/[id]/PostPageRecommendations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Maximize2,
  MoreHorizontal,
  PenLine,
  Repeat2,
  X as XIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CustomToast } from "@/components/ui/customSonner";
import {
  MOBILE_COMMENTS_HANDLE_HEIGHT,
  useMobileCommentsSheet,
} from "./useMobileCommentsSheet";
import { PostMediaLightbox } from "./PostMediaLightbox";

export const PostModal = ({
  postId,
  onClose,
  fullPage = false,
  onRequireAuth,
  isGuest = false,
}: {
  postId: string;
  onClose?: () => void;
  fullPage?: boolean;
  /** Guest shared-link: open login instead of mutating. */
  onRequireAuth?: () => void;
  isGuest?: boolean;
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCurrentMediaLoaded, setIsCurrentMediaLoaded] = useState(false);
  const [mediaFullscreenOpen, setMediaFullscreenOpen] = useState(false);
  const [openReplies, setOpenReplies] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [showFullText, setShowFullText] = useState(false);
  const [overlayTextExpanded, setOverlayTextExpanded] = useState(false);
  const searchParams = useSearchParams();
  const [mobileCommentsExpanded, setMobileCommentsExpanded] = useState(
    () => searchParams.get("focus") === "comments",
  );
  const {
    isLgDesktop,
    containerRef: commentsSheetContainerRef,
    sheetY,
    sheetMaxY,
    captionOpacity,
    captionY,
    textHeroOpacity,
    dragControls,
    onDragStart,
    onDrag,
    onDragEnd,
    onHandleClick,
  } = useMobileCommentsSheet(
    mobileCommentsExpanded,
    setMobileCommentsExpanded,
    postId,
  );
  const [newComment, setNewComment] = useState("");
  const newCommentRef = useRef<HTMLTextAreaElement>(null);
  const replyContentRef = useRef<HTMLTextAreaElement>(null);
  const [commentEmojiOpen, setCommentEmojiOpen] = useState(false);
  const [replyEmojiOpen, setReplyEmojiOpen] = useState(false);
  const {
    insertEmoji: insertCommentEmoji,
    syncSelection: syncCommentSelection,
    restoreFocus: restoreCommentFocus,
  } = useEmojiInsert(newCommentRef, newComment, setNewComment);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [selectedComment, setSelectedComment] =
    useState<PostsCommentsProps | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [selectedCommentParentId, setSelectedCommentParentId] = useState<
    string | null
  >(null);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState<Set<string>>(
    new Set(),
  );
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null,
  );
  const [replyContent, setReplyContent] = useState("");
  const {
    insertEmoji: insertReplyEmoji,
    syncSelection: syncReplySelection,
    restoreFocus: restoreReplyFocus,
  } = useEmojiInsert(replyContentRef, replyContent, setReplyContent);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [contextAlertOpen, setContextAlertOpen] = useState(false);
  const [contextAlertAction, setContextAlertAction] = useState("");

  const {
    handleLike,
    handleRepost,
    getPostById,
    increaseCommentCount,
    decreaseCommentCount,
    handlePostUpdate,
  } = useFeedContext();
  const { user } = useAuthContext();

  const requireAuthOr = (action: () => void) => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    action();
  };
  const {
    comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    openAnswers,
    addNewComment,
    handleLikeAny,
    deleteCommentContext,
    deleteAnswerContext,
    editAnswerComment,
    editComment,
    fetchNextAnswers,
    decreaseRepliesCount,
    addAnswerComment,
  } = useCommentsContext();
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerPostModal.icons;
  const texts = Feed.ServerPostModal.text;
  const buttons = Feed.ServerPostModal.buttons;
  const router = useRouter();
  const queryClient = useQueryClient();

  const post = getPostById(postId);
  const canComment = post?.can_comment !== false && !commentsDisabled;

  useEffect(() => {
    setMobileCommentsExpanded(searchParams.get("focus") === "comments");
    setOverlayTextExpanded(false);
  }, [searchParams, postId]);

  useEffect(() => {
    setCurrentMediaIndex(0);
    setIsCurrentMediaLoaded(false);
    setCommentsDisabled(post?.comments_disabled ?? false);
    const postHasMedia = Boolean(post?.medias?.length);
    setShowFullText(!postHasMedia);
  }, [postId, post?.comments_disabled, post?.medias?.length]);

  useEffect(() => {
    setIsCurrentMediaLoaded(false);
  }, [currentMediaIndex]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["comments", postId],
      refetchType: "inactive",
    });
  }, [postId, queryClient]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!post) return null;

  const handleDeleteCommentModal = (
    action?: boolean,
    comment?: PostsCommentsProps,
    parentId?: number,
  ) => {
    if (comment) {
      setSelectedComment(comment);
      setSelectedCommentParentId(parentId || null);
    }
    setDeleteCommentModalOpen(action ?? !deleteCommentModalOpen);
  };

  const handleCloseModal = () => {
    // Limpa estados locais
    setEditingCommentId(null);
    setReplyingToCommentId(null);
    setReplyContent("");
    setNewComment("");
    router.back();
  };

  const handleConfirmDeleteComment = async () => {
    if (selectedComment && post) {
      try {
        setIsDeletingComment(true);
        await deleteCommentAction(selectedComment.id);

        setDeleteCommentModalOpen(false);

        if (selectedCommentParentId) {
          // Deixa apenas o contexto gerenciar
          deleteAnswerContext(selectedCommentParentId, selectedComment.id);
          decreaseRepliesCount(selectedCommentParentId);

          // Não faça setQueryData manual
          // queryClient.setQueryData(...) ← REMOVA ISSO

          // Apenas invalide se realmente necessário
          queryClient.invalidateQueries({
            queryKey: ["comments", postId],
            refetchType: "inactive", // Só refetch se não estiver ativa
          });
        } else {
          decreaseCommentCount(post.id);
          deleteCommentContext(selectedComment.id);
          queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }

        setSelectedComment(null);
        setSelectedCommentParentId(null);
        setIsDeletingComment(false);
      } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        setDeleteCommentModalOpen(false);
        setSelectedComment(null);
        setSelectedCommentParentId(null);
        setIsDeletingComment(false);
      }
    }
  };

  const handleLoadMoreReplies = async (commentId: number) => {
    setLoadingMoreReplies((prev) => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });

    try {
      await fetchNextAnswers(comments.data.find((c) => c.id === commentId)!);
    } finally {
      setLoadingMoreReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleShareModal = (action?: boolean) => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    action ? setShareModalOpen(action) : setShareModalOpen((prev) => !prev);
  };

  const handleQuickRepost = async () => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    if (!post || isReposting) return;
    setIsReposting(true);
    try {
      const res = await fetch("/api/reposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        handleRepost(post.id, data.id);
        CustomToast.success("Post repostado!");
      } else {
        const data = await res.json();
        CustomToast.error(data.detail || "Erro ao repostar.");
      }
    } catch {
      CustomToast.error("Erro ao repostar.");
    } finally {
      setIsReposting(false);
    }
  };

  const handleUndoRepost = async () => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    if (!post?.user_repost_id || isReposting) return;
    setIsReposting(true);
    try {
      const res = await fetch(`/api/reposts/${post.user_repost_id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        handleRepost(post.id, null);
        CustomToast.neutral("Repost desfeito.");
      } else {
        CustomToast.error("Erro ao desfazer repost.");
      }
    } catch {
      CustomToast.error("Erro ao desfazer repost.");
    } finally {
      setIsReposting(false);
    }
  };

  const onClickLikeComment = (commentId: number) => {
    requireAuthOr(() => {
      handleLikeAny(commentId);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    });
  };

  const onClickLikeReply = (replyId: number, parentId: number) => {
    requireAuthOr(() => {
      handleLikeAny(replyId, parentId);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    });
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.comment);
  };

  const handleUpdateComment = async (
    commentId: number,
    content_type: string,
    comment: string,
    object_id: string | number,
    isReplie: boolean,
  ) => {
    if (!editingContent.trim()) return;
    setIsUpdatingComment(true);
    try {
      const response = await updateCommentAction({
        object_id: object_id,
        comment: comment,
        content_type: content_type,
        comment_id: commentId,
      });
      if (isReplie) {
        editAnswerComment(object_id, commentId, response);
      } else {
        editComment(response);
      }
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("Erro ao atualizar comentário:", error);
    } finally {
      setIsUpdatingComment(false);
    }
  };

  const handleReply = async (commentId: number) => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    if (!canComment || !replyContent.trim() || !post) return;
    setIsSubmittingReply(true);

    const replyData = {
      comment: replyContent,
      object_id: commentId,
      content_type: CommentContentType.comment,
    };

    try {
      const createdReply = await postComment(replyData);
      addAnswerComment(commentId, createdReply);
      setReplyContent("");
      setReplyingToCommentId(null);
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });

      // Abre automaticamente as respostas se estiverem fechadas
      if (!isRepliesOpen(commentId)) {
        toggleReplies(commentId);
      }
    } catch (error) {
      console.error("Falha ao enviar resposta:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const onClickLike = () => {
    requireAuthOr(() => handleLike(postId));
  };

  const nextMedia = () => {
    if (post && post.medias && currentMediaIndex < post.medias.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const hasMedia = post && post.medias && post.medias.length > 0;

  const postShellClassName =
    "bg-card border border-border/50 backdrop-blur-sm shadow-card rounded-2xl overflow-hidden";

  const isRepliesOpen = (id: string) => openReplies.has(id);
  const isRepliesLoading = (id: string) => loadingReplies.has(id);
  const isLoadingMoreReplies = (id: string) => loadingMoreReplies.has(id);

  const toggleReplies = async (commentId: number) => {
    if (!isRepliesOpen(commentId)) {
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.add(commentId);
        return next;
      });
      try {
        await openAnswers(commentId);
        setOpenReplies((prev) => {
          const next = new Set(prev);
          next.add(commentId);
          return next;
        });
      } finally {
        setLoadingReplies((prev) => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      }
    } else {
      setOpenReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  };

  const handleComment = async () => {
    if (isGuest) {
      onRequireAuth?.();
      return;
    }
    if (!canComment || !newComment.trim() || !post) return;
    setIsSubmittingComment(true);
    const newCommentData = {
      comment: newComment,
      object_id: post.id,
      content_type: "post",
    };

    try {
      const createdComment = await postComment(newCommentData);
      addNewComment(createdComment);
      increaseCommentCount(post.id);
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setIsSubmittingComment(false);
    } catch (error) {
      decreaseCommentCount(post.id);
      console.error("Falha ao enviar comentário:", error);
      setIsSubmittingComment(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose ? onClose() : router.back();
    }
  };

  const isPostOwner = Boolean(
    post.is_own || post.isOwn || (user?.username && post.username === user.username),
  );

  const handlePostContextAction = async (action: string) => {
    if (action === "toggle_comments") {
      const newState = !commentsDisabled;
      setCommentsDisabled(newState);
      try {
        const res = await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments_disabled: newState }),
        });
        if (res.ok) {
          handlePostUpdate(
            { ...post, comments_disabled: newState, can_comment: !newState },
            post.id,
          );
          CustomToast.neutral(newState ? "Comentários desativados." : "Comentários ativados.");
        } else {
          setCommentsDisabled(!newState);
          CustomToast.error("Erro ao alterar configuração de comentários.");
        }
      } catch {
        setCommentsDisabled(!newState);
        CustomToast.error("Erro ao alterar configuração de comentários.");
      }
      return;
    }

    setContextAlertAction(action);
    setContextAlertOpen(true);
  };

  const confirmPostContextAction = async () => {
    setContextAlertOpen(false);

    if (contextAlertAction === "delete") {
      try {
        const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
        if (res.ok || res.status === 204) {
          handlePostUpdate(null, post.id);
          CustomToast.success("Post deletado com sucesso.");
          if (onClose) onClose();
          else router.back();
        } else {
          CustomToast.error("Erro ao deletar post.");
        }
      } catch {
        CustomToast.error("Erro ao deletar post.");
      }
      return;
    }

    if (contextAlertAction === "remove") {
      handlePostUpdate(null, post.id);
      CustomToast.neutral("Post removido do seu feed.");
      if (onClose) onClose();
      else router.back();
      return;
    }

    if (contextAlertAction === "block") {
      try {
        await fetch(`/api/profiles/${post.username}/block`, { method: "POST" });
      } catch {
        // falha silenciosa — o post já some do feed
      }
      handlePostUpdate(null, post.id);
      CustomToast.info("Usuário bloqueado. Você não verá mais posts dele.");
      if (onClose) onClose();
      else router.back();
      return;
    }

    if (contextAlertAction === "mute") {
      try {
        await fetch(`/api/profiles/${post.username}/mute`, { method: "POST" });
      } catch {
        // falha silenciosa — o post já some do feed
      }
      handlePostUpdate(null, post.id);
      CustomToast.neutral("Usuário silenciado. Os posts dele não aparecerão mais.");
      if (onClose) onClose();
      else router.back();
      return;
    }

    if (contextAlertAction === "report") {
      try {
        await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: "post",
            object_id: post.id,
            reason: "other",
          }),
        });
        CustomToast.warning("Denúncia enviada. Nossa equipe irá analisar o post.");
      } catch {
        CustomToast.error("Erro ao enviar denúncia. Tente novamente.");
      }
    }
  };

  const postActionsMenu = (triggerClassName?: string) => {
    if (isGuest) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-none hover:rounded-none focus-visible:rounded-none text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
          onClick={() => onRequireAuth?.()}
          aria-label="Entrar para mais opções"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      );
    }

    return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-none hover:rounded-none focus-visible:rounded-none text-muted-foreground hover:text-foreground",
            triggerClassName,
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border border-border/50">
        {isPostOwner ? (
          <ContextMenuOwn
            handleContextAction={handlePostContextAction}
            commentsDisabled={commentsDisabled}
          />
        ) : (
          <ContextMenuNotMine handleContextAction={handlePostContextAction} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    );
  };

  const mobileCaptionBlock = (
    <div className="pointer-events-auto">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-sm font-semibold leading-tight text-white drop-shadow-sm">
          {post.name}
        </p>
        <HighlightedAchievementBadges
          achievements={post.highlighted_achievements}
          className="min-w-0 max-w-full"
          compact
        />
      </div>
      {post.comment ? (
        <div className="mt-3 w-full text-left">
          <p
            className={cn(
              "whitespace-pre-wrap text-sm leading-relaxed text-white/95 drop-shadow-sm",
              !overlayTextExpanded && "line-clamp-3",
            )}
          >
            <MentionText text={post.comment} />
          </p>
          {post.comment.length > 100 ? (
            <button
              type="button"
              onClick={() => setOverlayTextExpanded((v) => !v)}
              className="mt-0.5 text-xs font-medium text-white/70"
            >
              {overlayTextExpanded ? "ver menos" : "ver mais"}
            </button>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 text-white [&_button]:text-white/90 [&_button:hover]:text-white">
        <PostPropertiers.Root className="">
          <PostPropertiers.Like
            quantitylikesNumber={post.quantity_likes}
            clicked={post.user_already_like}
            object_id={post.id}
            content_type={LikeContentType.post}
            onAddLike={onClickLike}
            onDeleteLike={onClickLike}
            onAuthRequired={isGuest ? onRequireAuth : undefined}
          />
          <PostPropertiers.Comment
            quantity_comment={post.quantity_comment}
          />
        </PostPropertiers.Root>
      </div>
    </div>
  );

  const postBodyContent = (
    <div
      ref={commentsSheetContainerRef}
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col",
        "lg:flex-row",
      )}
    >
          {!fullPage && !hasMedia ? (
            <div className="absolute top-0 right-0 z-40 hidden items-center lg:flex">
              {postActionsMenu()}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (onClose ? onClose() : router.back())}
                className="h-9 w-9 shrink-0 rounded-none hover:rounded-none focus-visible:rounded-none text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
          ) : null}

          {/* Mobile: hero da legenda (posts sem mídia) */}
          {!hasMedia ? (
            <div
              className={cn(
                "relative min-h-0 flex-1 flex-col overflow-hidden lg:hidden",
                "flex",
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
              <div className="absolute -left-1/4 top-0 h-2/3 w-3/4 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -right-1/4 bottom-1/4 h-1/2 w-2/3 rounded-full bg-secondary/10 blur-3xl" />
              {!fullPage ? (
                <div
                  className={cn(
                    "absolute top-0 right-0 z-40 flex items-center",
                    mobileCommentsExpanded && "hidden",
                  )}
                >
                  {postActionsMenu()}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (onClose ? onClose() : router.back())}
                    className="h-9 w-9 rounded-none text-muted-foreground hover:text-foreground"
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>
              ) : null}
              <motion.div
                className="relative z-10 flex min-h-0 flex-1 flex-col justify-center px-3 pb-3 pt-12"
                style={{ opacity: textHeroOpacity }}
              >
                {/* Hug content quando curto; scroll com padding quando longo */}
                <div className="mx-auto max-h-full w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-border/50 bg-card/70 shadow-lg backdrop-blur-md">
                  <div className="p-5">
                    <div className="flex items-center gap-2.5">
                      <ProfileAvatar
                        displayName={post.name}
                        username={post.username}
                        profilePhoto={post.profile_photo}
                        sizeClass="h-11 w-11"
                        ringClass="ring-2 ring-primary/30"
                        fallbackTextClassName="text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="truncate text-sm font-semibold leading-tight">
                            {post.name}
                          </p>
                          <HighlightedAchievementBadges
                            achievements={post.highlighted_achievements}
                            className="min-w-0 max-w-full"
                            compact
                          />
                        </div>
                        <p className="mt-0.5 truncate text-xs leading-tight text-muted-foreground">
                          @{post.username}
                        </p>
                      </div>
                    </div>
                    {post.comment ? (
                      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                        <MentionText text={post.comment} />
                      </p>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Sem legenda
                      </p>
                    )}
                    <div className="mt-4 border-t border-border/40 pt-3">
                      <PostPropertiers.Root className="">
                        <PostPropertiers.Like
                          quantitylikesNumber={post.quantity_likes}
                          clicked={post.user_already_like}
                          object_id={post.id}
                          content_type={LikeContentType.post}
                          onAddLike={onClickLike}
                          onDeleteLike={onClickLike}
                          onAuthRequired={isGuest ? onRequireAuth : undefined}
                        />
                        <PostPropertiers.Comment
                          quantity_comment={post.quantity_comment}
                        />
                        <span className="text-xs text-muted-foreground">
                          <DateAndHour date={post.timestamp} />
                        </span>
                      </PostPropertiers.Root>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div
                className="shrink-0"
                style={{ height: MOBILE_COMMENTS_HANDLE_HEIGHT }}
                aria-hidden
              />
            </div>
          ) : null}

          {/* Media Section */}
          {hasMedia && (
            <div
              className={cn(
                "relative flex w-full",
                // Mobile: mídia + legenda no topo (sem stage esticado); desktop: coluna cheia
                "min-h-0 flex-1 flex-col justify-start bg-card lg:h-full lg:flex-none lg:items-center lg:justify-center lg:bg-black/50",
                // Modal: proporção atual. Full page (URL): mídia um pouco menor pra dar espaço aos comentários
                fullPage
                  ? "lg:w-[52%] 2xl:w-[55%]"
                  : "lg:w-1/2 2xl:w-4/6",
              )}
            >
              {/* Fechar + menu no mobile quando a mídia está em destaque */}
              {!fullPage ? (
                <div
                  className={cn(
                    "absolute top-0 right-0 z-40 flex items-center lg:hidden",
                    mobileCommentsExpanded && "hidden",
                  )}
                >
                  {postActionsMenu(
                    "text-white hover:bg-black/40 hover:text-white",
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (onClose ? onClose() : router.back())}
                    className="h-9 w-9 rounded-none text-white hover:bg-black/40 hover:text-white"
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>
              ) : null}
              {/* Mobile: stage 4:5 com max-height + contain (sem crop); desktop: preenche a coluna */}
              <div
                role={
                  post.medias[currentMediaIndex].media_type === "image"
                    ? "button"
                    : undefined
                }
                tabIndex={
                  post.medias[currentMediaIndex].media_type === "image"
                    ? 0
                    : undefined
                }
                onClick={() => {
                  if (post.medias[currentMediaIndex].media_type === "image") {
                    setMediaFullscreenOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    post.medias[currentMediaIndex].media_type === "image" &&
                    (e.key === "Enter" || e.key === " ")
                  ) {
                    e.preventDefault();
                    setMediaFullscreenOpen(true);
                  }
                }}
                className={cn(
                  "relative flex w-full items-center justify-center overflow-hidden bg-black",
                  // Mobile: cabe na viewport deixando espaço pra legenda + handle; pode encolher se faltar altura
                  "max-lg:mx-auto max-lg:aspect-[4/5] max-lg:max-h-[min(52dvh,100%)] max-lg:min-h-0 max-lg:shrink",
                  "lg:min-h-0 lg:flex-1 lg:cursor-default",
                  post.medias[currentMediaIndex].media_type === "image" &&
                    "cursor-zoom-in max-lg:cursor-zoom-in lg:cursor-zoom-in",
                )}
              >
                {!isCurrentMediaLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <LoadingComponent
                      showText={false}
                      className="h-10 w-10 text-muted-foreground"
                    />
                  </div>
                )}
                {post.medias[currentMediaIndex].media_type === "image" ? (
                  <ImageComponent
                    media_id={post.medias[currentMediaIndex].media_file || ""}
                    alt="Post media"
                    delivery="master"
                    objectFit="contain"
                    objectPosition="center"
                    className={cn(
                      "w-full transition-opacity duration-300",
                      isCurrentMediaLoaded ? "opacity-100" : "opacity-0",
                    )}
                    onLoad={() => setIsCurrentMediaLoaded(true)}
                  />
                ) : (
                  <VideoComponent
                    media_id={post.medias[currentMediaIndex].media_file || ""}
                    delivery="master"
                    allowFullscreen={false}
                    className={cn(
                      "max-h-full max-w-full transition-opacity duration-300",
                      isCurrentMediaLoaded ? "opacity-100" : "opacity-0",
                      "h-full w-full object-contain",
                    )}
                    onLoadedData={() => setIsCurrentMediaLoaded(true)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}

                {!overlayTextExpanded ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-3 top-3 z-20 h-9 w-9 rounded-full bg-black/55 text-white hover:bg-black/75 hover:text-white"
                    aria-label="Ver mídia em tela cheia"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMediaFullscreenOpen(true);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                ) : null}

                {/* Media Navigation — centralizado no stage da mídia (mobile + desktop) */}
                {!overlayTextExpanded && post?.medias && post.medias.length > 1 && (
                  <>
                    {currentMediaIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white lg:left-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevMedia();
                        }}
                      >
                        {icons.ChevronLeft}
                      </Button>
                    )}
                    {currentMediaIndex < post.medias.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 z-20 h-9 w-9 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white lg:right-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextMedia();
                        }}
                      >
                        {icons.ChevronRight}
                      </Button>
                    )}
                    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 space-x-2 lg:bottom-4">
                      {post.medias.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 w-2 rounded-full ${
                            index === currentMediaIndex
                              ? "bg-white"
                              : "bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Legenda mobile: cola na mídia | overlay com fade (expandido) */}
              <motion.div
                className={cn(
                  "w-full lg:hidden",
                  overlayTextExpanded
                    ? "pointer-events-none absolute inset-0 z-30 flex flex-col bg-gradient-to-t from-black via-black/90 to-black/50 px-4 pb-14 pt-16"
                    : "relative z-10 shrink-0 bg-card px-4 pb-5 pt-4",
                  mobileCommentsExpanded &&
                    !overlayTextExpanded &&
                    "pointer-events-none",
                )}
                style={
                  overlayTextExpanded
                    ? undefined
                    : { opacity: captionOpacity, y: captionY }
                }
              >
                <div
                  className={cn(
                    "pointer-events-auto",
                    overlayTextExpanded &&
                      "min-h-0 flex-1 overflow-y-auto overscroll-contain",
                  )}
                >
                  {mobileCaptionBlock}
                </div>
              </motion.div>

              {/* Empurra a barra de comentários para o fundo no mobile */}
              <div className="min-h-0 flex-1 bg-card lg:hidden" aria-hidden />
              {/* Espaço do handle do sheet no mobile */}
              <div
                className="shrink-0 lg:hidden"
                style={{ height: MOBILE_COMMENTS_HANDLE_HEIGHT }}
                aria-hidden
              />
            </div>
          )}

          <motion.div
            className={cn(
              "flex min-h-0 flex-col bg-card",
              isLgDesktop
                ? hasMedia
                  ? cn(
                      "relative min-h-0 flex-1 overflow-hidden",
                      // Modal: proporção atual. Full page: coluna de comentários mais larga
                      fullPage
                        ? "w-[48%] 2xl:w-[45%]"
                        : "w-1/2 2xl:w-2/6",
                    )
                  : // Full page texto: flex real (evita estourar com `contents`). Modal: inalterado
                    fullPage
                    ? "relative flex min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden"
                    : "contents"
                : "absolute inset-0 z-30 overflow-hidden",
            )}
            style={isLgDesktop ? undefined : { y: sheetY }}
            drag={isLgDesktop ? false : "y"}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={
              isLgDesktop ? undefined : { top: 0, bottom: sheetMaxY }
            }
            dragElastic={0.06}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
          >
            {/* Handle mobile: seta sobe/desce comentários */}
            <button
              type="button"
              onPointerDown={(e) => {
                if (isLgDesktop) return;
                dragControls.start(e);
              }}
              onClick={onHandleClick}
              className="flex w-full shrink-0 touch-none items-center justify-center gap-1 border-b border-border/50 py-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground lg:hidden"
              style={{ height: MOBILE_COMMENTS_HANDLE_HEIGHT }}
              aria-label={
                mobileCommentsExpanded
                  ? hasMedia
                    ? "Recolher comentários"
                    : "Voltar à legenda"
                  : "Expandir comentários"
              }
            >
              {mobileCommentsExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
              <span className="text-xs font-medium">
                {mobileCommentsExpanded
                  ? hasMedia
                    ? "Mídia"
                    : "Legenda"
                  : "Comentários"}
              </span>
            </button>

            {/* Detalhes do post — só no desktop (mobile usa overlay/hero) */}
            <div
              className={cn(
                "relative z-20 hidden shrink-0 border-b border-border/50 bg-card lg:block",
                hasMedia
                  ? cn(
                      "overflow-y-auto",
                      // Recolhido: só o necessário. Expandido: mais espaço para o texto.
                      showFullText ? "max-h-[55%]" : "max-h-none",
                    )
                  : cn(
                      "lg:w-1/2 lg:overflow-y-auto lg:border-r lg:border-border/50",
                      fullPage && "min-h-0 min-w-0 lg:max-h-full",
                    ),
              )}
            >
              <div className="absolute top-0 right-0 z-30 flex items-center">
                <div className={cn(!hasMedia && "lg:hidden")}>{postActionsMenu()}</div>
                {!fullPage ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => (onClose ? onClose() : router.back())}
                    className={cn(
                      "h-9 w-9 shrink-0 rounded-none hover:rounded-none focus-visible:rounded-none text-muted-foreground hover:text-foreground",
                      !hasMedia && "lg:hidden",
                    )}
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                ) : null}
              </div>
              <div className="px-4 py-3 lg:px-5 lg:py-3">
              <div className={cn("mb-2", !fullPage ? "pr-16 lg:pr-20" : "pr-11")}>
                <div className="flex items-center space-x-3 min-w-0">
                  <ProfileAvatar
                    displayName={post.name}
                    username={post.username}
                    profilePhoto={post.profile_photo}
                    sizeClass="h-10 w-10 lg:h-11 lg:w-11"
                    ringClass="ring-2 ring-primary/30"
                    fallbackTextClassName="text-sm"
                  />
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="inline-flex min-w-0 max-w-full items-center gap-2">
                        <h3 className="truncate text-base font-bold leading-tight lg:text-lg">
                          {post.name}
                        </h3>
                        {post.verified && texts.verified}
                      </div>
                      <HighlightedAchievementBadges
                        achievements={post.highlighted_achievements}
                        className="min-w-0 max-w-full"
                      />
                    </div>
                    <p className="mt-0.5 text-sm leading-tight text-muted-foreground">
                      @{post.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Texto do post — no mobile fica no overlay/hero; no PC permanece aqui */}
              {post.comment && (
                <div className="mb-2">
                  {hasMedia ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullText((s) => !s)}
                        className="-ml-2 mb-0 h-8 rounded-md px-2 py-1 text-primary hover:bg-primary/10 hover:text-primary/80"
                      >
                        {showFullText ? (
                          <>
                            {icons.EyeOff}
                            Esconder texto
                          </>
                        ) : (
                          <>
                            {icons.Eye}
                            Ver texto completo
                          </>
                        )}
                      </Button>
                      {showFullText ? (
                        <p className="mt-1.5 text-foreground leading-relaxed whitespace-pre-wrap">
                          <MentionText text={post.comment} />
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="px-1 text-foreground leading-relaxed whitespace-pre-wrap">
                      <MentionText text={post.comment} />
                    </p>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <PostPropertiers.Root className="mt-1 space-x-4">
                <PostPropertiers.Like
                  quantitylikesNumber={post.quantity_likes}
                  clicked={post.user_already_like}
                  object_id={post.id}
                  content_type={LikeContentType.post}
                  onAddLike={onClickLike}
                  onDeleteLike={onClickLike}
                  onAuthRequired={isGuest ? onRequireAuth : undefined}
                />
                <PostPropertiers.Comment
                  quantity_comment={post.quantity_comment}
                />
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-muted-foreground hover:text-primary p-2",
                        post.user_repost_id && "text-primary"
                      )}
                      onClick={
                        isGuest
                          ? (e) => {
                              e.preventDefault();
                              onRequireAuth?.();
                            }
                          : undefined
                      }
                    >
                      <Repeat2 className="w-5 h-5 mr-2" />
                      {post.quantity_reposts}
                    </Button>
                  </DropdownMenuTrigger>
                  {!isGuest ? (
                  <DropdownMenuContent
                    align="end"
                    className="bg-background/95 backdrop-blur-xl border border-border/50"
                  >
                    {post.user_repost_id ? (
                      <DropdownMenuItem
                        onClick={handleUndoRepost}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        disabled={isReposting}
                      >
                        <XIcon className="w-4 h-4 mr-2" />
                        Desfazer repost
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={handleQuickRepost}
                          disabled={isReposting}
                        >
                          <Repeat2 className="w-4 h-4 mr-2" />
                          Repostar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareModal()}
                        >
                          <PenLine className="w-4 h-4 mr-2" />
                          Repostar com comentário
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                  ) : null}
                </DropdownMenu>
                <span className="text-sm text-muted-foreground">
                  <DateAndHour date={post.timestamp} />
                </span>
              </PostPropertiers.Root>
              </div>
            </div>

            {/* Comments Section */}
            <div
              className={cn(
                "relative flex min-h-0 flex-col overflow-hidden bg-card",
                hasMedia
                  ? "min-h-0 flex-1"
                  : cn(
                      "min-h-0 flex-1 lg:w-1/2 lg:min-h-0 lg:overflow-hidden",
                      // Modal: h-auto. Full page: preenche a coluna sem estourar
                      fullPage ? "lg:h-full" : "lg:h-auto",
                    ),
              )}
            >
              {hasMedia ? (
                <div className="hidden shrink-0 border-b border-border/50 px-4 pb-3 pt-3 lg:block">
                  <h4 className="text-sm font-semibold">Comentários</h4>
                </div>
              ) : (
                <div className="hidden lg:block">{texts.comments}</div>
              )}

              <div className="min-h-0 flex-1 overflow-hidden max-lg:pt-4 lg:pt-2">
              {comments.data.length > 0 ? (
                <Virtuoso
                  style={{ height: "100%" }}
                  increaseViewportBy={200}
                  data={comments.data}
                  endReached={loadMore}
                  components={{
                    Scroller: ScrollArea,
                    Header: () => (
                      <div className="h-2 lg:h-3" aria-hidden />
                    ),
                  }}
                  overscan={3}
                  itemContent={(index, comment) => (
                    <div className="flex flex-1 flex-col px-4" key={comment.id}>
                      <div className="space-y-4 pb-4">
                        <div key={comment.id} className="space-y-2">
                          <div className="flex items-start space-x-3 pl-1">
                            <div className="pl-2 flex-shrink-0">
                              <ProfileAvatar
                                displayName={comment.created_by_user_name}
                                username={comment.user_username}
                                profilePhoto={comment.created_by_user_photo}
                                sizeClass="h-12 w-12"
                                ringClass="ring-2 ring-primary/30"
                                fallbackTextClassName="text-sm"
                              />
                            </div>

                            {/* Container principal do comentário */}
                            <div className="flex-1 min-w-0">
                              {/* Cabeçalho do comentário com nome, data e ações */}
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="shrink-0 text-sm font-medium">
                                      {comment.created_by_user_name}
                                    </span>
                                    <HighlightedAchievementBadges
                                      achievements={comment.highlighted_achievements}
                                      className="max-w-full"
                                      compact
                                      iconOnly
                                      max={3}
                                      showOverflowCounter={false}
                                    />
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                      <DateAndHour date={comment.timestamp} />
                                    </span>
                                    {comment.is_pinned && (
                                      <span className="shrink-0 text-xs text-primary font-medium flex items-center gap-1">
                                        📌 Fixado
                                      </span>
                                    )}
                                    {comment.is_hidden && post.username === user?.username && (
                                      <span className="shrink-0 text-xs text-muted-foreground font-medium flex items-center gap-1">
                                        👁 Oculto
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* 3-dot menu para comentário raiz */}
                                <CommentActionMenu
                                  comment={comment}
                                  postOwnerUsername={post.username}
                                  currentUsername={user?.username}
                                  onEdit={() => handleEditComment(comment)}
                                  onDelete={() =>
                                    handleDeleteCommentModal(true, comment, undefined)
                                  }
                                  onCommentUpdate={(updated) => editComment(updated)}
                                />
                              </div>

                              {/* Conteúdo do comentário */}
                              <div className="bg-muted/50 rounded-lg p-3 w-full">
                                {editingCommentId === comment.id ? (
                                  <MentionTextarea
                                    value={editingContent}
                                    onChange={setEditingContent}
                                    className="min-h-[80px] text-sm bg-background border-border/50 w-full"
                                    autoFocus
                                  />
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap">
                                    <MentionText text={comment.comment} />
                                  </p>
                                )}

                                {editingCommentId === comment.id && (
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      disabled={isUpdatingComment}
                                      onClick={() =>
                                        handleUpdateComment(
                                          comment.id,
                                          CommentContentType.post,
                                          editingContent,
                                          postId,
                                          false,
                                        )
                                      }
                                    >
                                      {isUpdatingComment ? (
                                        <span className="flex items-center gap-1">
                                          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-primary rounded-full"></span>
                                          Salvando...
                                        </span>
                                      ) : (
                                        "Salvar"
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      disabled={isUpdatingComment}
                                      onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingContent("");
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Ações do comentário (like, responder) */}
                              <div className="flex items-center space-x-2 mt-2">
                                <PostPropertiers.Root className="">
                                  <PostPropertiers.Like
                                    quantitylikesNumber={comment.quantity_likes}
                                    clicked={comment.user_already_like}
                                    object_id={comment.id}
                                    content_type={LikeContentType.comment}
                                    onAddLike={() =>
                                      onClickLikeComment(comment.id)
                                    }
                                    onDeleteLike={() =>
                                      onClickLikeComment(comment.id)
                                    }
                                    onAuthRequired={
                                      isGuest ? onRequireAuth : undefined
                                    }
                                  />
                                </PostPropertiers.Root>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!canComment}
                                  onClick={() =>
                                    requireAuthOr(() => {
                                      if (!canComment) return;
                                      setReplyingToCommentId(comment.id);
                                    })
                                  }
                                  className="text-xs text-muted-foreground hover:text-primary p-2 h-auto"
                                >
                                  {buttons.answer}
                                </Button>
                              </div>

                              {/* Input de resposta - MANTIDO COMO ESTAVA */}
                              {replyingToCommentId === comment.id && canComment && (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleReply(comment.id);
                                  }}
                                  className="mt-3 space-y-2"
                                >
                                  <MentionTextarea
                                    ref={replyContentRef}
                                    value={replyContent}
                                    onChange={setReplyContent}
                                    onSelect={syncReplySelection}
                                    onClick={syncReplySelection}
                                    onKeyUp={syncReplySelection}
                                    onKeyDown={(e) => handleKeyDown(e, () => handleReply(comment.id))}
                                    placeholder="Escreva uma resposta..."
                                    className="min-h-[80px] text-sm bg-muted/50 border-border/50 w-full"
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-between">
                                    <EmojiPickerButton
                                      open={replyEmojiOpen}
                                      onOpenChange={setReplyEmojiOpen}
                                      onBeforeOpen={syncReplySelection}
                                      onPick={insertReplyEmoji}
                                      onClosed={restoreReplyFocus}
                                      disabled={isSubmittingReply}
                                    />
                                    <div className="flex gap-2 justify-end">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      disabled={
                                        isSubmittingReply ||
                                        !replyContent.trim()
                                      }
                                    >
                                      {isSubmittingReply
                                        ? "Enviando..."
                                        : "Responder"}
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      disabled={isSubmittingReply}
                                      onClick={() => {
                                        setReplyingToCommentId(null);
                                        setReplyContent("");
                                        setReplyEmojiOpen(false);
                                      }}
                                    >
                                      Cancelar
                                    </Button>
                                    </div>
                                  </div>
                                </form>
                              )}
                            </div>
                          </div>

                          {/* Botão Ver Respostas */}
                          {comment.quantity_replies > 0 && (
                            <div className="flex mt-1 text-xs text-muted-foreground cursor-pointer ml-14">
                              {icons.ArrowRight}
                              {!isRepliesOpen(comment.id) ? (
                                <p
                                  onClick={() => {
                                    toggleReplies(comment.id);
                                  }}
                                  className="hover:text-primary transition-colors"
                                >
                                  Ver Respostas ({comment.quantity_replies})
                                </p>
                              ) : (
                                <p
                                  onClick={() => {
                                    toggleReplies(comment.id);
                                  }}
                                  className="hover:text-primary transition-colors"
                                >
                                  Ocultar Respostas
                                </p>
                              )}
                            </div>
                          )}

                          {/* Loading indicator for this comment */}
                          {isRepliesLoading(comment.id) && (
                            <div className="ml-14 mt-2">
                              <LoadingComponent
                                text="Carregando respostas"
                                showText={true}
                              />
                            </div>
                          )}

                          {/* Replies */}
                          {isRepliesOpen(comment.id) &&
                            comment.answers &&
                            comment.answers.results.length > 0 && (
                              <div className="ml-14 space-y-3 pt-2">
                                {comment.answers.results.map((reply) => (
                                  <div
                                    key={reply.id}
                                    className="flex items-start space-x-3"
                                  >
                                    <div className="pl-2 flex-shrink-0">
                                      <ProfileAvatar
                                        displayName={reply.created_by_user_name}
                                        username={reply.user_username}
                                        profilePhoto={reply.created_by_user_photo}
                                        sizeClass="h-8 w-8"
                                        ringClass="ring-2 ring-primary/30"
                                        fallbackTextClassName="text-xs"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      {/* Cabeçalho da reply com nome, data e ações */}
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="min-w-0 flex-1">
                                          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="shrink-0 text-xs font-medium">
                                              {reply.created_by_user_name}
                                            </span>
                                            <HighlightedAchievementBadges
                                              achievements={
                                                reply.highlighted_achievements
                                              }
                                              className="max-w-full"
                                              compact
                                              iconOnly
                                              max={3}
                                              showOverflowCounter={false}
                                            />
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                              <DateAndHour
                                                date={reply.timestamp}
                                              />
                                            </span>
                                          </div>
                                        </div>

                                        {/* 3-dot menu para reply */}
                                        <CommentActionMenu
                                          comment={reply as PostsCommentsProps}
                                          postOwnerUsername={post.username}
                                          currentUsername={user?.username}
                                          onEdit={() => handleEditComment(reply)}
                                          onDelete={() =>
                                            handleDeleteCommentModal(true, reply as PostsCommentsProps, comment.id)
                                          }
                                          onCommentUpdate={(updated) =>
                                            editAnswerComment(comment.id, reply.id, updated)
                                          }
                                          isReply
                                        />
                                      </div>

                                      {/* Conteúdo da reply */}
                                      <div className="bg-muted/60 rounded-lg p-3">
                                        {editingCommentId === reply.id ? (
                                          <MentionTextarea
                                            value={editingContent}
                                            onChange={setEditingContent}
                                            className="min-h-[60px] text-sm bg-background border-border/50 w-full"
                                            autoFocus
                                          />
                                        ) : (
                                          <p className="text-sm break-words whitespace-pre-wrap">
                                            <MentionText text={reply.comment} />
                                          </p>
                                        )}

                                        {editingCommentId === reply.id && (
                                          <div className="flex gap-2 mt-2">
                                            <Button
                                              size="sm"
                                              disabled={isUpdatingComment}
                                              onClick={() =>
                                                handleUpdateComment(
                                                  reply.id,
                                                  CommentContentType.comment,
                                                  editingContent,
                                                  comment.id,
                                                  true,
                                                )
                                              }
                                            >
                                              {isUpdatingComment ? (
                                                <span className="flex items-center gap-1">
                                                  <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-primary rounded-full"></span>
                                                  Salvando...
                                                </span>
                                              ) : (
                                                "Salvar"
                                              )}
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              disabled={isUpdatingComment}
                                              onClick={() => {
                                                setEditingCommentId(null);
                                                setEditingContent("");
                                              }}
                                            >
                                              Cancelar
                                            </Button>
                                          </div>
                                        )}
                                      </div>

                                      {/* Like da reply */}
                                      <div className="flex items-center space-x-4 mt-1 ml-2">
                                        <PostPropertiers.Like
                                          quantitylikesNumber={
                                            reply.quantity_likes
                                          }
                                          clicked={reply.user_already_like}
                                          object_id={reply.id}
                                          content_type={LikeContentType.comment}
                                          onAddLike={() =>
                                            onClickLikeReply(
                                              reply.id,
                                              comment.id,
                                            )
                                          }
                                          onDeleteLike={() =>
                                            onClickLikeReply(
                                              reply.id,
                                              comment.id,
                                            )
                                          }
                                          onAuthRequired={
                                            isGuest ? onRequireAuth : undefined
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}

                                {/* Botão Carregar Mais Respostas */}
                                {comment.answers.next && (
                                  <div className="text-sm text-center mt-2">
                                    {isLoadingMoreReplies(comment.id) ? (
                                      <LoadingComponent
                                        text="Carregando mais respostas..."
                                        showText={true}
                                      />
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleLoadMoreReplies(comment.id)
                                        }
                                        className="text-muted-foreground hover:text-primary"
                                      >
                                        Carregar mais respostas
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  )}
                />
              ) : (
                <div className="flex h-full min-h-[8rem] flex-col items-center justify-center p-4 text-center">
                  {buttons.comment}
                </div>
              )}

              {isFetchingNextPage && (
                <div className="w-full bg-opacity-40 p-2 text-center text-white z-10">
                  <LoadingComponent
                    text="Carregando novos comentários"
                    showText={true}
                  />
                </div>
              )}
              </div>

              {/* Comment Input */}
              {commentsDisabled ? (
                <div className="shrink-0 border-t border-border/50 p-4 text-center text-sm text-muted-foreground">
                  Comentários desativados pelo autor.
                </div>
              ) : isGuest ? (
                <div className="sticky bottom-0 w-full shrink-0 border-t border-border/50 bg-card p-3 lg:p-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => onRequireAuth?.()}
                  >
                    Entre para comentar...
                  </Button>
                </div>
              ) : !canComment ? (
                <div className="shrink-0 border-t border-border/50 p-4 text-center text-sm text-muted-foreground">
                  Você não tem permissão para comentar nesta publicação.
                </div>
              ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment();
                }}
                className="sticky bottom-0 w-full shrink-0 border-t border-border/50 bg-card p-3 lg:p-4"
              >
                <div className="relative w-full">
                  <MentionTextarea
                    ref={newCommentRef}
                    value={newComment}
                    onChange={setNewComment}
                    onSelect={syncCommentSelection}
                    onClick={syncCommentSelection}
                    onKeyUp={syncCommentSelection}
                    onKeyDown={(e) => handleKeyDown(e, handleComment)}
                    placeholder="Adicione um comentário..."
                    className="min-h-10 w-full resize-none bg-muted/50 border-border/50 py-2.5 pl-10 pr-24"
                    rows={1}
                    autoGrow
                    maxGrowHeightPx={140}
                    dropdownSide="top"
                  />
                  <div className="absolute bottom-1 left-1 z-10">
                    <EmojiPickerButton
                      open={commentEmojiOpen}
                      onOpenChange={setCommentEmojiOpen}
                      onBeforeOpen={syncCommentSelection}
                      onPick={insertCommentEmoji}
                      onClosed={restoreCommentFocus}
                      disabled={isSubmittingComment}
                      buttonClassName="h-8 w-8 hover:bg-transparent"
                    />
                  </div>
                  {newComment.trim() ? (
                    <Button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="absolute bottom-1.5 right-1.5 h-8 bg-gradient-primary px-3 py-1 hover:shadow-glow-primary/30"
                    >
                      {isSubmittingComment ? (
                        <span className="flex items-center gap-1">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {icons.Send}
                          Enviar
                        </span>
                      )}
                    </Button>
                  ) : null}
                </div>
              </form>
              )}
            </div>
          </motion.div>
        </div>

  );

  const sharables = (
    <>
      <ShareModal
        post={post}
        handleShareModal={handleShareModal}
        shareModalOpen={shareModalOpen}
      />

      {selectedComment && (
        <DeleteCommentModal
          open={deleteCommentModalOpen}
          onOpenChange={(open) => {
            setDeleteCommentModalOpen(open);
            if (!open) {
              setSelectedComment(null);
              setSelectedCommentParentId(null);
            }
          }}
          onConfirm={handleConfirmDeleteComment}
          comment={selectedComment as PostsCommentsProps}
          isDeleting={isDeletingComment}
        />
      )}

      <ContextMenuAction
        alertAction={contextAlertAction}
        alertOpen={contextAlertOpen}
        confirmAction={confirmPostContextAction}
        setAlertOpen={setContextAlertOpen}
      />

      {hasMedia ? (
        <PostMediaLightbox
          medias={post.medias}
          initialIndex={currentMediaIndex}
          open={mediaFullscreenOpen}
          onOpenChange={setMediaFullscreenOpen}
        />
      ) : null}
    </>
  );

  if (fullPage) {
    return (
      <div className={cn("min-w-0", !isGuest && "ml-0 lg:ml-20")}>
        <div
          className={cn(
            "mx-auto w-full min-w-0 px-3 pt-3 pb-10 sm:px-4 sm:pt-4",
            hasMedia ? "max-w-5xl" : "max-w-4xl",
          )}
        >
          <div
            className={cn(
              postShellClassName,
              "w-full min-w-0 overflow-hidden",
              // Guest: no quick-messages chrome — reserve only guest header.
              isGuest
                ? hasMedia
                  ? "h-[calc(100dvh-var(--layout-header-height)-8.5rem)] max-h-[calc(100dvh-var(--layout-header-height)-8.5rem)]"
                  : "h-[min(36rem,calc(100dvh-var(--layout-header-height)-2rem))] max-h-[calc(100dvh-var(--layout-header-height)-2rem)]"
                : hasMedia
                  ? "h-[calc(100dvh-var(--layout-header-height)-var(--layout-quick-messages-height)-8.5rem)] max-h-[calc(100dvh-var(--layout-header-height)-var(--layout-quick-messages-height)-8.5rem)]"
                  : "h-[min(36rem,calc(100dvh-var(--layout-header-height)-var(--layout-quick-messages-height)-2rem))] max-h-[calc(100dvh-var(--layout-header-height)-var(--layout-quick-messages-height)-2rem)]",
            )}
          >
            {postBodyContent}
          </div>
          <PostPageRecommendations
            currentPostId={postId}
            authorUsername={post.username}
            isGuest={isGuest}
          />
        </div>
        {sharables}
      </div>
    );
  }

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        className={cn(
          postShellClassName,
          "gap-0 p-0 !max-w-none flex flex-col",
          "w-[calc(100%-0.5rem)] sm:w-[calc(100%-2rem)]",
          // Mobile: encaixa entre header e bottom nav + global messages (não cobre o chrome)
          "max-lg:top-[calc(var(--layout-header-height)+0.35rem)] max-lg:translate-y-0",
          "max-lg:h-[calc(100dvh-var(--layout-header-height)-var(--layout-bottom-nav-height)-var(--layout-quick-messages-height)-env(safe-area-inset-bottom,0px)-0.7rem)]",
          // Desktop: modal centrado (comportamento atual)
          "lg:top-[50%] lg:translate-y-[-50%]",
          hasMedia
            ? "lg:h-[calc(100dvh-var(--layout-header-height)-2rem)] lg:!w-[70vw] lg:!max-w-[min(70vw,1400px)]"
            : "lg:h-[calc(100vh-var(--layout-header-height)-2rem)] lg:!max-w-5xl",
        )}
        style={undefined}
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        {postBodyContent}
        {sharables}
      </DialogContent>
    </Dialog>
  );
};

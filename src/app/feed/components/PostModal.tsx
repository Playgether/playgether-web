"use client";

import { useCallback, useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { updateCommentAction } from "@/actions/updateComment";
import { CommentContentType } from "@/components/content_types/CommentContentType";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { handleKeyDown } from "@/components/layouts/SendOnEnterKey/sendOnEnterKey";
import { CommentActionMenu } from "./CommentActionMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  MessageCircle,
  MessageCircleOff,
  PenLine,
  Repeat2,
  X as XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomToast } from "@/components/ui/customSonner";

export const PostModal = ({
  postId,
  onClose,
  fullPage = false,
}: {
  postId: number;
  onClose?: () => void;
  fullPage?: boolean;
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isCurrentMediaLoaded, setIsCurrentMediaLoaded] = useState(false);
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const [showFullText, setShowFullText] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteCommentModalOpen, setDeleteCommentModalOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeletingComment, setIsDeletingComment] = useState(false);
  const [selectedComment, setSelectedComment] =
    useState<PostsCommentsProps | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  const [selectedCommentParentId, setSelectedCommentParentId] = useState<
    number | null
  >(null);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState<Set<number>>(
    new Set(),
  );
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(
    null,
  );
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  const [isReposting, setIsReposting] = useState(false);

  const {
    handleLike,
    handleRepost,
    getPostById,
    increaseCommentCount,
    decreaseCommentCount,
    handlePostUpdate,
  } = useFeedContext();
  const { user } = useAuthContext();
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
    action ? setShareModalOpen(action) : setShareModalOpen((prev) => !prev);
  };

  const handleQuickRepost = async () => {
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
    handleLikeAny(commentId);
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  };

  const onClickLikeReply = (replyId: number, parentId: number) => {
    handleLikeAny(replyId, parentId);
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  };

  useEffect(() => {
    setCurrentMediaIndex(0);
    setIsCurrentMediaLoaded(false);
    setCommentsDisabled(post?.comments_disabled ?? false);
  }, [postId]);

  useEffect(() => {
    setIsCurrentMediaLoaded(false);
  }, [currentMediaIndex]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["comments", postId],
      refetchType: "inactive",
    });
  }, [postId, queryClient]);

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.comment);
  };

  const handleUpdateComment = async (
    commentId: number,
    content_type: string,
    comment: string,
    object_id: number,
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
    if (!replyContent.trim() || !post) return;
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
    handleLike(postId);
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

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasMedia = post && post.medias && post.medias.length > 0;

  const isRepliesOpen = (id: number) => openReplies.has(id);
  const isRepliesLoading = (id: number) => loadingReplies.has(id);
  const isLoadingMoreReplies = (id: number) => loadingMoreReplies.has(id);

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
    if (!newComment.trim() || !post) return;
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

  const postBodyContent = (
    <div className="flex min-h-0 w-full flex-col sm:flex-row">
          {/* Media Section */}
          {hasMedia && (
            <div
              className={`${
                hasMedia ? "sm:w-[55%] 2xl:w-[65%] w-full" : "w-full"
              } bg-black/50 flex items-center justify-center relative h-full`}
            >
              <div className="relative w-full h-full flex items-center justify-center min-h-[200px]">
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
                    objectFit="contain"
                    className={`w-full transition-opacity duration-300 ${
                      isCurrentMediaLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={() => setIsCurrentMediaLoaded(true)}
                  />
                ) : (
                  <VideoComponent
                    media_id={post.medias[currentMediaIndex].media_file || ""}
                    className={`max-h-full max-w-full h-full w-full object-cover transition-opacity duration-300 ${
                      isCurrentMediaLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoadedData={() => setIsCurrentMediaLoaded(true)}
                  />
                )}
              </div>

              {/* Media Navigation */}
              {post?.medias && post.medias.length > 1 && (
                <>
                  {currentMediaIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={prevMedia}
                    >
                      {icons.ChevronLeft}
                    </Button>
                  )}
                  {currentMediaIndex < post.medias.length - 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                      onClick={nextMedia}
                    >
                      {icons.ChevronRight}
                    </Button>
                  )}

                  {/* Media indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {post.medias.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
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
          )}

          {/* Content Section */}
          <div className="flex flex-col overflow-auto flex-1">
            {/* Post Header */}
            <div className="p-6 pb-2 border-b border-border/50 sticky bg-background z-10 top-0 ">
              <div className="flex items-center justify-between mb-2 z-20 gap-2">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <ProfileAvatar
                    displayName={post.name}
                    username={post.username}
                    profilePhoto={post.profile_photo}
                    sizeClass="h-12 w-12"
                    ringClass="ring-2 ring-primary/30"
                    fallbackTextClassName="text-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-2">
                        <h3 className="w-fit max-w-full shrink-0 text-lg font-bold">
                          {post.name}
                        </h3>
                        {post.verified && texts.verified}
                      </div>
                      <HighlightedAchievementBadges
                        achievements={post.highlighted_achievements}
                        className="min-w-0"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{post.username}
                    </p>
                  </div>
                </div>

                {/* 3-dot menu — aparece só para o dono do post */}
                {(post.is_own || post.username === user?.username) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border border-border/50">
                      <DropdownMenuItem
                        onClick={async () => {
                          const newState = !commentsDisabled;
                          setCommentsDisabled(newState);
                          try {
                            const res = await fetch(`/api/posts/${post.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ comments_disabled: newState }),
                            });
                            if (res.ok) {
                              handlePostUpdate({ ...post, comments_disabled: newState }, post.id);
                              CustomToast.neutral(newState ? "Comentários desativados." : "Comentários ativados.");
                            } else {
                              setCommentsDisabled(!newState);
                              CustomToast.error("Erro ao alterar configuração de comentários.");
                            }
                          } catch {
                            setCommentsDisabled(!newState);
                            CustomToast.error("Erro ao alterar configuração de comentários.");
                          }
                        }}
                        className="flex items-center gap-2 hover:bg-muted/50"
                      >
                        {commentsDisabled ? (
                          <><MessageCircle className="h-4 w-4" /> Ligar comentários</>
                        ) : (
                          <><MessageCircleOff className="h-4 w-4" /> Desligar comentários</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={async () => {
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
                        }}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Post Text Toggle */}
              {post.comment && (
                <div className="mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFullText((s) => !s)}
                    className="text-primary hover:text-primary/80 px-3 py-1.5 rounded-md hover:bg-primary/10 -ml-2 mb-2"
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
                  {showFullText && (
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.comment}
                    </p>
                  )}
                </div>
              )}

              {/* Post Actions */}
              <PostPropertiers.Root className="">
                <PostPropertiers.Like
                  quantitylikesNumber={post.quantity_likes}
                  clicked={post.user_already_like}
                  object_id={post.id}
                  content_type={LikeContentType.post}
                  onAddLike={onClickLike}
                  onDeleteLike={onClickLike}
                />
                <PostPropertiers.Comment
                  quantity_comment={post.quantity_comment}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-muted-foreground hover:text-primary p-2",
                        post.user_repost_id && "text-primary"
                      )}
                    >
                      <Repeat2 className="w-5 h-5 mr-2" />
                      {post.quantity_reposts}
                    </Button>
                  </DropdownMenuTrigger>
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
                </DropdownMenu>
                <span className="text-sm text-muted-foreground">
                  <DateAndHour date={post.timestamp} />
                </span>
              </PostPropertiers.Root>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col relative">
              {texts.comments}

              {comments.data.length > 0 ? (
                <Virtuoso
                  increaseViewportBy={200}
                  data={comments.data}
                  endReached={loadMore}
                  components={{
                    Scroller: ScrollArea,
                  }}
                  overscan={3}
                  itemContent={(index, comment) => (
                    <div className="px-4 flex-1 flex flex-col" key={comment.id}>
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
                              <div className="flex items-center justify-between mb-1 gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                  <div className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-x-2 gap-y-1">
                                    <span className="shrink-0 text-sm font-medium">
                                      {comment.created_by_user_name}
                                    </span>
                                    <HighlightedAchievementBadges
                                      achievements={
                                        comment.highlighted_achievements
                                      }
                                      className="max-w-full min-w-0"
                                    />
                                  </div>
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
                                  <Textarea
                                    value={editingContent}
                                    onChange={(e) =>
                                      setEditingContent(e.target.value)
                                    }
                                    className="min-h-[80px] text-sm bg-background border-border/50 w-full"
                                    autoFocus
                                  />
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap">
                                    {comment.comment}
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
                                  />
                                </PostPropertiers.Root>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    setReplyingToCommentId(comment.id)
                                  }
                                  className="text-muted-foreground hover:text-primary"
                                >
                                  {buttons.answer}
                                </Button>
                              </div>

                              {/* Input de resposta - MANTIDO COMO ESTAVA */}
                              {replyingToCommentId === comment.id && (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleReply(comment.id);
                                  }}
                                  className="mt-3 space-y-2"
                                >
                                  <Textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                      setReplyContent(e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(e, () => handleReply(comment.id))}
                                    placeholder="Escreva uma resposta..."
                                    className="min-h-[80px] text-sm bg-muted/20 border-border/50 w-full"
                                    autoFocus
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
                                      }}
                                    >
                                      Cancelar
                                    </Button>
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
                                      <div className="flex items-center justify-between mb-1 gap-2">
                                        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                          <div className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-x-2 gap-y-1">
                                            <span className="shrink-0 text-xs font-medium">
                                              {reply.created_by_user_name}
                                            </span>
                                            <HighlightedAchievementBadges
                                              achievements={
                                                reply.highlighted_achievements
                                              }
                                              className="max-w-full min-w-0"
                                            />
                                          </div>
                                          <span className="shrink-0 text-xs text-muted-foreground">
                                            <DateAndHour
                                              date={reply.timestamp}
                                            />
                                          </span>
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
                                      <div className="bg-muted/30 rounded-lg p-3">
                                        {editingCommentId === reply.id ? (
                                          <Textarea
                                            value={editingContent}
                                            onChange={(e) =>
                                              setEditingContent(e.target.value)
                                            }
                                            className="min-h-[60px] text-sm bg-background border-border/50 w-full"
                                            autoFocus
                                          />
                                        ) : (
                                          <p className="text-sm break-words whitespace-pre-wrap">
                                            {reply.comment}
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
                <div className="flex items-center justify-center h-full text-center space-y-4 p-4">
                  {buttons.comment}
                </div>
              )}

              {isFetchingNextPage && (
                <div className="w-full p-2 bg-opacity-40 text-white text-center z-10">
                  <LoadingComponent
                    text="Carregando novos comentários"
                    showText={true}
                  />
                </div>
              )}

              {/* Comment Input */}
              {commentsDisabled ? (
                <div className="p-4 border-t border-border/50 text-center text-sm text-muted-foreground">
                  Comentários desativados pelo autor.
                </div>
              ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment();
                }}
                className="p-4 border-t border-border/50 sticky bg-background/100 bottom-0 w-full"
              >
                <div className="relative">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, handleComment)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 bg-muted/20 border-border/50 w-full pr-24 resize-none"
                    rows={1}
                  />
                  {newComment.trim() && (
                    <Button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="absolute bottom-2 right-2 bg-gradient-primary hover:shadow-glow-primary/30 px-3 py-1 h-8"
                    >
                      {isSubmittingComment ? (
                        <span className="flex items-center gap-1">
                          <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-primary rounded-full" />
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          {icons.Send}
                          Enviar
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </form>
              )}
            </div>
          </div>
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
    </>
  );

  if (fullPage) {
    return (
      <div className="ml-0 md:ml-20 min-h-layout-main p-4 md:p-6">
        {onClose && (
          <button
            onClick={onClose}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao feed
          </button>
        )}
        <div
          className="mx-auto max-w-5xl bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl overflow-hidden"
          style={{ height: "calc(100vh - var(--layout-header-height) - 8rem)" }}
        >
          {postBodyContent}
        </div>
        {sharables}
      </div>
    );
  }

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[70vw] w-full h-[95vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 overflow-hidden"
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

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

export const PostModal = ({ postId }: { postId: number }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
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

  const {
    handleLike,
    getPostById,
    increaseCommentCount,
    decreaseCommentCount,
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
  const components = Feed.ServerFeedPost.components;
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

  const onClickLikeComment = (commentId: number) => {
    handleLikeAny(commentId);
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  };

  const onClickLikeReply = (replyId: number, parentId: number) => {
    handleLikeAny(replyId, parentId);
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
  };

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

  return (
    <Dialog defaultOpen onOpenChange={() => router.back()}>
      <DialogContent
        className="max-w-[70vw] w-full h-[95vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 overflow-hidden"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <div className="flex min-h-0 w-full flex-col sm:flex-row">
          {/* Media Section */}
          {hasMedia && (
            <div
              className={`${
                hasMedia ? "sm:w-[55%] 2xl:w-[65%] w-full" : "w-full"
              } bg-black/50 flex items-center justify-center relative h-full`}
            >
              {post.medias[currentMediaIndex].media_type === "image" ? (
                <ImageComponent
                  media_id={post.medias[currentMediaIndex].media_file || ""}
                  alt="Post media"
                  objectFit="contain"
                  className="w-full transition-transform duration-300"
                />
              ) : (
                <div className="relative h-full">
                  <VideoComponent
                    media_id={post.medias[currentMediaIndex].media_file || ""}
                    className="max-h-full max-w-full h-full w-full object-cover"
                  />
                </div>
              )}

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
              <div className="flex items-center space-x-3 mb-2 z-20">
                <div className="w-12 h-12 relative rounded-full overflow-hidden ring-2 ring-primary/30">
                  {post.profile_photo ? (
                    <ImageComponent
                      media_id={post.profile_photo || ""}
                      className="object-cover rounded-full h-10 w-10"
                    />
                  ) : (
                    components.NoImageProfile
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-lg">{post.name}</h3>
                    {post.verified && texts.verified}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    @{post.username}
                  </p>
                </div>
              </div>

              {/* Post Text Toggle */}
              {post.comment && (
                <div className="mb-2">
                  {showFullText ? (
                    <div className="space-y-3">
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                        {post.comment}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullText(false)}
                        className="text-primary hover:text-primary/80 p-0 h-auto"
                      >
                        {icons.EyeOff}
                        Esconder texto
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullText(true)}
                      className="text-primary hover:text-primary/80 p-0 h-auto"
                    >
                      {icons.Eye}
                      Ver texto completo
                    </Button>
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
                <PostPropertiers.Share
                  quantity_reposts={post.quantity_reposts}
                  onClickShare={handleShareModal}
                />
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
                            {comment.created_by_user_photo ? (
                              <div className="w-12 h-12 pl-2 relative rounded-full overflow-hidden ring-2 ring-primary/30 flex-shrink-0">
                                <ImageComponent
                                  media_id={comment.created_by_user_photo}
                                  alt={`Profile photo of the user ${comment?.created_by_user_name}`}
                                  className="object-cover rounded-full"
                                />
                              </div>
                            ) : (
                              components.NoImageProfile
                            )}

                            {/* Container principal do comentário */}
                            <div className="flex-1 min-w-0">
                              {/* Cabeçalho do comentário com nome, data e ações */}
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-sm">
                                    {comment.created_by_user_name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    <DateAndHour date={comment.timestamp} />
                                  </span>
                                </div>

                                {/* Ícones de ação para comentário raiz - sempre visíveis */}
                                {comment.user_username === user?.username && (
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                                      onClick={() => handleEditComment(comment)}
                                      title="Editar comentário"
                                    >
                                      {icons.FaEdit}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() =>
                                        handleDeleteCommentModal(
                                          true,
                                          {
                                            id: comment.id,
                                            comment: comment.comment,
                                            created_by_user_name:
                                              comment.created_by_user_name,
                                            user_username:
                                              comment.user_username,
                                            object_id: comment.object_id,
                                            content_type: comment.content_type,
                                            quantity_likes:
                                              comment.quantity_likes,
                                            answers: comment.answers,
                                            timestamp: comment.timestamp,
                                            user_already_like:
                                              comment.user_already_like,
                                            created_by_user_photo:
                                              comment.created_by_user_photo,
                                            edited: comment.edited,
                                            quantity_comment:
                                              comment.quantity_comment,
                                            user: comment.user,
                                            quantity_replies:
                                              comment.quantity_replies,
                                          },
                                          undefined,
                                        )
                                      }
                                      title="Excluir comentário"
                                    >
                                      {icons.FaTrash}
                                    </Button>
                                  </div>
                                )}
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

                              {/* Input de resposta */}
                              {replyingToCommentId === comment.id && (
                                <form
                                  onSubmit={(e) => {
                                    e.preventDefault();
                                    handleReply(comment.id);
                                  }}
                                  className="mt-3 space-y-2"
                                >
                                  <Textarea // ALTERADO: de Input para Textarea
                                    value={replyContent}
                                    onChange={(e) =>
                                      setReplyContent(e.target.value)
                                    }
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
                                      } // ALTERADO: desabilitado até ter conteúdo
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
                                    {reply.created_by_user_photo ? (
                                      <div className="w-8 h-8 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-primary/20">
                                        <ImageComponent
                                          media_id={reply.created_by_user_photo}
                                          alt={`Profile photo of the user ${reply?.created_by_user_name}`}
                                          className="object-cover w-full h-full"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-8 h-8 flex-shrink-0">
                                        {components.NoImageReplieProfile}
                                      </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                      {/* Cabeçalho da reply com nome, data e ações */}
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-xs">
                                            {reply.created_by_user_name}
                                          </span>
                                          <span className="text-xs text-muted-foreground">
                                            <DateAndHour
                                              date={reply.timestamp}
                                            />
                                          </span>
                                        </div>

                                        {/* Ícones de ação para reply - sempre visíveis */}
                                        {reply.user_username ===
                                          user?.username && (
                                          <div className="flex items-center space-x-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-muted-foreground hover:text-primary"
                                              onClick={() =>
                                                handleEditComment(reply)
                                              }
                                              title="Editar resposta"
                                            >
                                              {icons.FaEdit}
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                              onClick={() =>
                                                handleDeleteCommentModal(
                                                  true,
                                                  {
                                                    id: reply.id,
                                                    comment: reply.comment,
                                                    created_by_user_name:
                                                      reply.created_by_user_name,
                                                    user_username:
                                                      reply.user_username,
                                                    object_id: reply.object_id,
                                                    content_type:
                                                      reply.content_type,
                                                    quantity_likes:
                                                      reply.quantity_likes,
                                                    answers: reply.answers,
                                                    timestamp: reply.timestamp,
                                                    user_already_like:
                                                      reply.user_already_like,
                                                    created_by_user_photo:
                                                      reply.created_by_user_photo,
                                                    edited: reply.edited,
                                                    quantity_comment:
                                                      reply.quantity_comment,
                                                    user: reply.user,
                                                    quantity_replies:
                                                      reply.quantity_replies,
                                                  },
                                                  comment.id,
                                                )
                                              }
                                              title="Excluir resposta"
                                            >
                                              {icons.FaTrash}
                                            </Button>
                                          </div>
                                        )}
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
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment();
                }}
                className="p-4 border-t border-border/50 sticky bg-background/100 flex-1 bottom-0 w-full"
              >
                <div className="flex space-x-3">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 bg-muted/20 border-border/50"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isSubmittingComment}
                    className={`bg-gradient-primary hover:shadow-glow-primary/30 ${
                      isSubmittingComment || newComment === ""
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {isSubmittingComment ? "..." : icons.Send}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

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
      </DialogContent>
    </Dialog>
  );
};

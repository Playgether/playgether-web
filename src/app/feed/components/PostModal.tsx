"use client";

import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart } from "lucide-react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { PostProps } from "../types/PostProps";
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

interface PostModalProps {
  post: PostProps;
}

export const PostModal = ({ post }: PostModalProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  // showReplies boolean -> track opened replies per comment id
  const [openReplies, setOpenReplies] = useState<Set<number>>(new Set());
  // loading state per comment id while fetching its answers
  const [loadingReplies, setLoadingReplies] = useState<Set<number>>(new Set());
  const [showFullText, setShowFullText] = useState(true);
  const [newComment, setNewComment] = useState("");
  const { handleLike } = useFeedContext();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const {
    comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    openAnswers,
  } = useCommentsContext();
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerPostModal.icons;
  const texts = Feed.ServerPostModal.text;
  const buttons = Feed.ServerPostModal.buttons;
  const components = Feed.ServerFeedPost.components;
  const router = useRouter();

  const handleShareModal = useCallback((action?: boolean) => {
    action ? setShareModalOpen(action) : setShareModalOpen((prev) => !prev);
  }, []);

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment("");
    }
  };

  const onClickLike = useCallback(() => {
    handleLike(post.id);
  }, [handleLike, post.id]);

  const nextMedia = () => {
    if (post.medias && currentMediaIndex < post.medias.length - 1) {
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

  const hasMedia = post.medias && post.medias.length > 0;

  // helpers for reply open/loading state
  const isRepliesOpen = (id: number) => openReplies.has(id);
  const isRepliesLoading = (id: number) => loadingReplies.has(id);

  const toggleReplies = async (commentId: number) => {
    if (!isRepliesOpen(commentId)) {
      // open: set loading, fetch answers, then mark opened
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
      // close
      setOpenReplies((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
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
          {/* Media Section (if exists) */}
          {hasMedia && (
            <div
              className={`${
                hasMedia ? "sm:w-[55%] 2xl:w-[65%] w-full" : "w-full"
              } bg-black/50 flex items-center justify-center relative h-full`}
            >
              {post.medias![currentMediaIndex].media_type === "image" ? (
                <ImageComponent
                  media_id={post.medias![currentMediaIndex].media_file}
                  alt="Post media"
                  objectFit="contain"
                  className="w-full transition-transform duration-300"
                />
              ) : (
                <div className="relative h-full">
                  <VideoComponent
                    media_id={post.medias![currentMediaIndex].media_file}
                    className="max-h-full max-w-full h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Media Navigation */}
              {post.medias!.length > 1 && (
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
                  {currentMediaIndex < post.medias!.length - 1 && (
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
                    {post.medias!.map((_, index) => (
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
                      media_id={post.profile_photo}
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
                      <p className="text-foreground leading-relaxed">
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
                  quantity_likes={post.quantity_likes}
                  user_already_like={post.user_already_like}
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
                    Scroller: ScrollArea, // Usa seu ScrollArea como container principal
                  }}
                  overscan={3}
                  itemContent={(index, comment) => (
                    <div className=" px-4 flex-1 flex flex-col">
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
                            <div className="flex flex-col w-full">
                              <div className="flex-1 min-w-0 bg-background/50">
                                <div className="bg-muted/50 rounded-lg p-3 w-fit">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-sm">
                                      {comment.created_by_user_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      <DateAndHour date={comment.timestamp} />
                                    </span>
                                  </div>
                                  <p className="text-sm">{comment.comment}</p>
                                </div>
                                <div className="flex items-center space-x-4 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-muted-foreground hover:text-red-500 p-2 h-auto"
                                  >
                                    {icons.Heart}
                                    {comment.quantity_likes}
                                  </Button>
                                  {buttons.answer}
                                </div>
                              </div>

                              {comment.quantity_replies > 0 && (
                                <div className="flex mt-1 text-xs text-muted-foreground cursor-pointer ml-2">
                                  {icons.ArrowRight}
                                  {!isRepliesOpen(comment.id) ? (
                                    <p
                                      onClick={() => {
                                        toggleReplies(comment.id);
                                      }}
                                    >
                                      Ver Respostas ({comment.quantity_replies})
                                    </p>
                                  ) : (
                                    <p
                                      onClick={() => {
                                        toggleReplies(comment.id);
                                      }}
                                    >
                                      Ocultar Respostas
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Loading indicator for this comment (shows under the link, only for the clicked comment) */}
                          {isRepliesLoading(comment.id) && (
                            <div className="ml-11 mt-2">
                              <LoadingComponent
                                text="Carregando respostas"
                                showText={true}
                              />
                            </div>
                          )}

                          {/* Replies (render only when that comment is opened) */}
                          {isRepliesOpen(comment.id) && comment.answers && (
                            <div className="ml-11 space-y-2 pt-5">
                              {comment.answers.results.map((reply) => (
                                <div
                                  key={reply.id}
                                  className="flex items-start space-x-3"
                                >
                                  {reply.created_by_user_photo ? (
                                    <ImageComponent
                                      media_id={reply.created_by_user_photo}
                                      alt={`Profile photo of the user ${reply?.created_by_user_name}`}
                                    />
                                  ) : (
                                    components.NoImageReplieProfile
                                  )}

                                  <div className="flex-1 min-w-0">
                                    <div className="bg-muted/30 rounded-lg p-2">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-xs">
                                          {reply.created_by_user_name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          <DateAndHour date={reply.timestamp} />
                                        </span>
                                      </div>
                                      <p className="text-sm">{reply.comment}</p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-muted-foreground hover:text-red-500 p-0 h-auto"
                                      >
                                        {icons.Heart}
                                        {reply.quantity_likes}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              <div className="text-sm text-center text-muted-foreground cursor-pointer">
                                <p>Carregar Mais</p>
                              </div>
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
              <div className="p-4 border-t border-border/50 sticky bg-background/100 flex-1 bottom-0 w-full">
                <div className="flex space-x-3">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicione um comentário..."
                    className="flex-1 bg-muted/20 border-border/50"
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSubmitComment()
                    }
                  />
                  <Button
                    size="icon"
                    className="bg-gradient-primary hover:shadow-glow-primary/30"
                    onClick={handleSubmitComment}
                  >
                    {icons.Send}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ShareModal
          post={post}
          handleShareModal={handleShareModal}
          shareModalOpen={shareModalOpen}
        />
      </DialogContent>
    </Dialog>
  );
};

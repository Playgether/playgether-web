import { use, useState } from "react";
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

interface PostModalProps {
  post: PostProps;
}

interface Comment {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

const mockComments: Comment[] = [
  {
    id: "1",
    user: {
      name: "Sophia Andrade",
      username: "sophia.andrade",
      avatar: "/src/assets/avatar-sophia.jpg",
    },
    content: "Excelente post! Concordo totalmente com sua análise.",
    timestamp: "há 2 horas",
    likes: 12,
    replies: [
      {
        id: "1-1",
        user: {
          name: "Aline Moreira",
          username: "aline.moreira",
          avatar: "/src/assets/avatar-aline.jpg",
        },
        content: "Também achei interessante!",
        timestamp: "há 1 hora",
        likes: 3,
      },
    ],
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },

  {
    id: "2",
    user: {
      name: "Mia Santos",
      username: "mia.santos",
      avatar: "/src/assets/avatar-mia.jpg",
    },
    content: "Muito bom! Estou esperando ansiosamente pela próxima temporada.",
    timestamp: "há 3 horas",
    likes: 8,
  },
];

export const PostModal = ({ post }: PostModalProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullText, setShowFullText] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(post.user_already_like);
  const [likeCount, setLikeCount] = useState(post.likes);
  const { comments } = useCommentsContext();
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerPostModal.icons;
  const texts = Feed.ServerPostModal.text;
  const buttons = Feed.ServerPostModal.buttons;
  const components = Feed.ServerFeedPost.components;
  const router = useRouter();
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Add comment logic here
      setNewComment("");
    }
  };

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

  const hasMedia = post.medias && post.medias.length > 0;

  return (
    <Dialog defaultOpen onOpenChange={() => router.back()}>
      <DialogContent
        className="max-w-[70vw] w-full h-[95vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20 overflow-hidden"
        // style={{
        //   maxHeight: "calc(100vh - 164px)",
        //   // top: "64px",
        //   // marginBottom: "100px",
        // }}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`${
                      isLiked ? "text-red-500" : "text-muted-foreground"
                    } hover:text-red-500 p-2`}
                  >
                    <Heart
                      className={`w-5 h-5 mr-2 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                    {post.quantity_likes}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary p-2"
                  >
                    {icons.MessageCircle}
                    {post.quantity_comment}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary p-2"
                  >
                    {icons.Share2}
                    {post.quantity_reposts}
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  <DateAndHour date={post.timestamp} />
                </span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col relative">
              {texts.comments}

              <ScrollArea className=" px-4 flex-1 flex flex-col">
                {comments.data.length > 0 ? (
                  <div className="space-y-4 pb-4">
                    {comments.data.map((comment) => (
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
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/50 rounded-lg p-3">
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
                            <div className="flex items-center space-x-4 mt-2 ml-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground hover:text-red-500 p-0 h-auto"
                              >
                                {icons.Heart}
                                {comment.quantity_likes}
                              </Button>
                              {buttons.answer}
                            </div>
                          </div>
                        </div>

                        {/* Replies */}
                        {comment.answers && (
                          <div className="ml-11 space-y-2">
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
                                  components.NoImageProfile
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
                                    <p className="text-xs">{reply.comment}</p>
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
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="items-center justify-center text-center space-y-4 p-4">
                    {buttons.comment}
                  </div>
                )}
              </ScrollArea>

              {/* Comment Input */}
              <div className="p-4 border-t border-border/50 sticky bg-background/100 bottom-0 w-full">
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
      </DialogContent>
    </Dialog>
  );
};

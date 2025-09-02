import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Heart, MessageCircle, Share2, Send, ChevronLeft, ChevronRight, Play, MoreHorizontal, Edit, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ReplyModal } from "./ReplyModal";
import { ShareModal } from "./ShareModal";

interface ExpandedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    user: {
      name: string;
      username: string;
      avatar: string;
      verified?: boolean;
    };
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    shares: number;
    liked?: boolean;
    media?: Array<{
      type: 'image' | 'video';
      url: string;
    }>;
  };
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
  liked?: boolean;
  replies?: Comment[];
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: {
      name: 'Sophia Andrade',
      username: 'sophia.andrade',
      avatar: '/src/assets/avatar-sophia.jpg'
    },
    content: 'Excelente post! Concordo totalmente com sua análise.',
    timestamp: 'há 2 horas',
    likes: 12,
    replies: [
      {
        id: '1-1',
        user: {
          name: 'Aline Moreira',
          username: 'aline.moreira',
          avatar: '/src/assets/avatar-aline.jpg'
        },
        content: 'Também achei interessante!',
        timestamp: 'há 1 hora',
        likes: 3
      }
    ]
  },
  {
    id: '2',
    user: {
      name: 'Mia Santos',
      username: 'mia.santos',
      avatar: '/src/assets/avatar-mia.jpg'
    },
    content: 'Muito bom! Estou esperando ansiosamente pela próxima temporada.',
    timestamp: 'há 3 horas',
    likes: 8
  }
];

export const ExpandedModal = ({ open, onOpenChange, post }: ExpandedModalProps) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isLiked, setIsLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [heartAnimation, setHeartAnimation] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    if (!isLiked) {
      setHeartAnimation(true);
      setTimeout(() => setHeartAnimation(false), 300);
    }
  };

  const handleCommentLike = (commentId: string, isReply?: boolean, parentId?: string) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (!isReply && comment.id === commentId) {
          return {
            ...comment,
            liked: !comment.liked,
            likes: comment.liked ? comment.likes - 1 : comment.likes + 1
          };
        }
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(reply => 
              reply.id === commentId ? {
                ...reply,
                liked: !reply.liked,
                likes: reply.liked ? reply.likes - 1 : reply.likes + 1
              } : reply
            )
          };
        }
        return comment;
      });
    });
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'Você',
          username: 'you',
          avatar: '/src/assets/avatar-mia.jpg'
        },
        content: newComment,
        timestamp: 'agora',
        likes: 0
      };
      setComments(prev => [...prev, comment]);
      setNewComment("");
    }
  };

  const handleSubmitReply = (content: string) => {
    if (selectedComment && content.trim()) {
      const reply: Comment = {
        id: Date.now().toString(),
        user: {
          name: 'Você',
          username: 'you',
          avatar: '/src/assets/avatar-mia.jpg'
        },
        content,
        timestamp: 'agora',
        likes: 0
      };

      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.id === selectedComment.id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), reply]
            };
          }
          return comment;
        });
      });
    }
  };

  const nextMedia = () => {
    if (post.media && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  const hasMedia = post.media && post.media.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background/95 backdrop-blur-xl border border-primary/20">
          <div className="flex h-full">
            {/* Media Section */}
            {hasMedia && (
              <div className="w-3/5 bg-black/50 flex items-center justify-center relative">
                {post.media![currentMediaIndex].type === 'image' ? (
                  <img
                    src={post.media![currentMediaIndex].url}
                    alt="Post media"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <video
                      src={post.media![currentMediaIndex].url}
                      className="max-h-full max-w-full object-contain"
                      controls
                      style={{
                        filter: 'hue-rotate(15deg) saturate(1.1)',
                      }}
                    />
                  </div>
                )}
                
                {/* Media Navigation */}
                {post.media!.length > 1 && (
                  <>
                    {currentMediaIndex > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevMedia}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                    )}
                    {currentMediaIndex < post.media!.length - 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextMedia}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    )}
                    
                    {/* Media indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {post.media!.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Content Section */}
            <div className={`${hasMedia ? 'w-2/5' : 'w-full'} flex flex-col`}>
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/50 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="w-12 h-12 ring-2 ring-primary/30">
                    <AvatarImage src={post.user.avatar} alt={post.user.name} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {post.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-lg">{post.user.name}</h3>
                      {post.user.verified && (
                        <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{post.user.username}</p>
                  </div>
                </div>
                
                {/* Post Text */}
                {post.content && (
                  <div className="mb-4 relative">
                    {showFullText ? (
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl z-20 p-4 rounded-lg border border-border/50">
                        <p className="text-foreground leading-relaxed mb-4">{post.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullText(false)}
                          className="text-primary hover:text-primary/80"
                        >
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
                      className={`${isLiked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 p-2 ${heartAnimation ? 'animate-heart-burst' : ''}`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {likeCount}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary p-2">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {post.comments}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-primary p-2"
                      onClick={() => setShareModalOpen(true)}
                    >
                      <Share2 className="w-5 h-5 mr-2" />
                      {post.shares}
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                </div>
              </div>
              
              {/* Comments Section */}
              <div className="flex-1 flex flex-col">
                <div className="p-4">
                  <h4 className="font-semibold mb-4">Comentários</h4>
                </div>
                
                <ScrollArea className="flex-1 px-4">
                  {comments.length > 0 ? (
                    <div className="space-y-4 pb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="space-y-2">
                          <div className="flex items-start space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                              <AvatarFallback className="bg-gradient-primary text-white text-xs">
                                {comment.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-better-contrast rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{comment.user.name}</span>
                                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                  {comment.user.username === 'you' && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="p-0 h-auto ml-auto">
                                          <MoreHorizontal className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500">
                                          <Trash className="w-4 h-4 mr-2" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <div className="flex items-center space-x-4 mt-2 ml-3">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={`text-xs p-0 h-auto ${comment.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                                  onClick={() => handleCommentLike(comment.id)}
                                >
                                  <Heart className={`w-3 h-3 mr-1 ${comment.liked ? 'fill-current' : ''}`} />
                                  {comment.likes}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs text-muted-foreground hover:text-primary p-0 h-auto"
                                  onClick={() => {
                                    setSelectedComment(comment);
                                    setReplyModalOpen(true);
                                  }}
                                >
                                  Responder
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Replies */}
                          {comment.replies && (
                            <div className="ml-11 space-y-2">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex items-start space-x-3">
                                  <Avatar className="w-7 h-7">
                                    <AvatarImage src={reply.user.avatar} alt={reply.user.name} />
                                    <AvatarFallback className="bg-gradient-secondary text-white text-xs">
                                      {reply.user.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-better-contrast rounded-lg p-2">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-sm">{reply.user.name}</span>
                                        <span className="text-xs text-muted-foreground">{reply.timestamp}</span>
                                        {reply.user.username === 'you' && (
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button variant="ghost" size="sm" className="p-0 h-auto ml-auto">
                                                <MoreHorizontal className="w-3 h-3" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                              <DropdownMenuItem>
                                                <Edit className="w-4 h-4 mr-2" />
                                                Editar
                                              </DropdownMenuItem>
                                              <DropdownMenuItem className="text-red-500">
                                                <Trash className="w-4 h-4 mr-2" />
                                                Excluir
                                              </DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        )}
                                      </div>
                                      <p className="text-sm">{reply.content}</p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-1 ml-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`text-xs p-0 h-auto ${reply.liked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                                        onClick={() => handleCommentLike(reply.id, true, comment.id)}
                                      >
                                        <Heart className={`w-3 h-3 mr-1 ${reply.liked ? 'fill-current' : ''}`} />
                                        {reply.likes}
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
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Seja o primeiro a comentar</p>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                
                {/* Comment Input */}
                <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur-xl">
                  <div className="flex space-x-3">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="flex-1 bg-better-contrast border-border/50"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
                    <Button 
                      size="icon" 
                      className="bg-gradient-primary hover:shadow-glow-primary/30"
                      onClick={handleSubmitComment}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ReplyModal
        open={replyModalOpen}
        onOpenChange={setReplyModalOpen}
        comment={selectedComment}
        onSubmitReply={handleSubmitReply}
      />
      
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        post={post}
        onRepost={() => console.log('Repost')}
      />
    </>
  );
};
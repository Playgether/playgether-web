"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, MessageCircle } from "lucide-react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { PostProps } from "@/app/feed/types/PostProps";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";

interface PostsTabProps {
  profile: getProfileByUsernameProps | null;
  onPostClick: (postId: number) => void;
}

export function PostsTab({ profile, onPostClick }: PostsTabProps) {
  const {
    textPosts,
    textNextPage,
    hasLoadedText,
    isLoadingText,
    isLoadingMoreText,
    loadTextPosts,
  } = useProfilePostsContext();

  useEffect(() => {
    if (profile?.username && !hasLoadedText) {
      loadTextPosts(profile.username, null, false);
    }
  }, [profile?.username, hasLoadedText, loadTextPosts]);

  const handleLoadMore = () => {
    if (profile?.username && textNextPage && !isLoadingMoreText) {
      loadTextPosts(profile.username, textNextPage, true);
    }
  };

  if (!profile?.username) return null;

  if (isLoadingText && !hasLoadedText) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingComponent showText={false} className="h-8 w-8" />
      </div>
    );
  }

  if (hasLoadedText && textPosts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum post de texto encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {textPosts.map((post) => (
          <TextPostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
          />
        ))}
      </div>
      {textNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMoreText}
            className="hover:shadow-card transition-shadow duration-200"
          >
            {isLoadingMoreText ? (
              <span className="flex items-center gap-2">
                <LoadingComponent showText={false} className="h-4 w-4" />
                Carregando...
              </span>
            ) : (
              "Carregar mais"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function TextPostCard({
  post,
  onClick,
}: {
  post: PostProps;
  onClick: () => void;
}) {
  const truncatedComment =
    post.comment && post.comment.length > 200
      ? post.comment.slice(0, 200) + "..."
      : post.comment;

  return (
    <Card
      className="hover:shadow-card transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-foreground text-sm leading-relaxed flex-1 line-clamp-3">
              {truncatedComment || "Sem legenda"}
            </p>
            <span className="text-sm text-muted-foreground flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              <DateAndHour date={post.timestamp} />
            </span>
          </div>
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <div
              className="flex items-center gap-2 text-muted-foreground cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="h-4 w-4" />
              <span>{post.quantity_likes}</span>
            </div>
            <div
              className="flex items-center gap-2 text-muted-foreground cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.quantity_comment}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

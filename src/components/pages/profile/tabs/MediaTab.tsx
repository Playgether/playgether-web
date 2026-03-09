"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Play } from "lucide-react";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import VideoComponent from "@/components/layouts/VideoComponent/VideoComponent";
import { Button } from "@/components/ui/button";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { PostProps } from "@/app/feed/types/PostProps";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";

interface MediaTabProps {
  profile: getProfileByUsernameProps | null;
  onPostClick: (postId: number) => void;
}

export function MediaTab({ profile, onPostClick }: MediaTabProps) {
  const {
    mediaPosts,
    mediaNextPage,
    hasLoadedMedia,
    isLoadingMedia,
    isLoadingMoreMedia,
    loadMediaPosts,
  } = useProfilePostsContext();

  useEffect(() => {
    if (profile?.username && !hasLoadedMedia) {
      loadMediaPosts(profile.username, null, false);
    }
  }, [profile?.username, hasLoadedMedia, loadMediaPosts]);

  const handleLoadMore = () => {
    if (profile?.username && mediaNextPage && !isLoadingMoreMedia) {
      loadMediaPosts(profile.username, mediaNextPage, true);
    }
  };

  if (!profile?.username) return null;

  if (isLoadingMedia && !hasLoadedMedia) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingComponent showText={false} className="h-8 w-8" />
      </div>
    );
  }

  if (hasLoadedMedia && mediaPosts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum post com mídia encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaPosts.map((post) => (
          <MediaPostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post.id)}
          />
        ))}
      </div>
      {mediaNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMoreMedia}
            className="hover:shadow-card transition-shadow duration-200"
          >
            {isLoadingMoreMedia ? (
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

function MediaPostCard({
  post,
  onClick,
}: {
  post: PostProps;
  onClick: () => void;
}) {
  const firstMedia = post.medias?.[0];
  const mediaCount = post.medias?.length ?? 0;
  const isVideo = firstMedia?.media_type === "video";

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:shadow-card transition-all duration-200"
      onClick={onClick}
    >
      <div className="relative aspect-square">
        {firstMedia ? (
          isVideo ? (
            <div className="relative w-full h-full bg-muted">
              <VideoComponent
                media_id={firstMedia.media_file}
                className="object-cover w-full h-full"
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <ImageComponent
                media_id={firstMedia.media_file}
                alt="Post media"
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
              />
              {mediaCount > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-xs text-white flex items-center gap-1">
                  <span>+{mediaCount}</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            Sem mídia
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{post.quantity_likes}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{post.quantity_comment}</span>
            </div>
          </div>
          {mediaCount > 1 && (
            <span className="text-xs text-muted-foreground">
              {mediaCount} mídias
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

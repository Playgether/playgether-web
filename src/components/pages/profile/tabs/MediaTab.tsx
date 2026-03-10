"use client";

import { useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, MoreHorizontal, Play, Trash2 } from "lucide-react";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import VideoComponent from "@/components/layouts/VideoComponent/VideoComponent";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { PostProps } from "@/app/feed/types/PostProps";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";
import { ProfileTabSearchBar } from "./ProfileTabSearchBar";

interface MediaTabProps {
  profile: getProfileByUsernameProps | null;
  isOwner?: boolean;
  onPostClick: (postId: number) => void;
  onDeletePost?: (post: PostProps) => void;
}

export function MediaTab({
  profile,
  isOwner = false,
  onPostClick,
  onDeletePost,
}: MediaTabProps) {
  const {
    mediaPosts,
    mediaNextPage,
    hasLoadedMedia,
    isLoadingMedia,
    isLoadingMoreMedia,
    loadMediaPosts,
    mediaSearch,
    setMediaSearch,
    mediaDateFrom,
    mediaDateTo,
    setMediaDateRange,
    clearMediaFilters,
    hasActiveMediaFilters,
  } = useProfilePostsContext();

  const handleMediaSearchSubmit = useCallback(
    (filters: {
      search: string | null;
      timestampStart: string | null;
      timestampEnd: string | null;
    }) => {
      if (!profile?.username) return;
      loadMediaPosts(profile.username, null, false, {
        search: filters.search ?? undefined,
        timestampStart: filters.timestampStart ?? undefined,
        timestampEnd: filters.timestampEnd ?? undefined,
      });
    },
    [profile?.username, loadMediaPosts]
  );

  useEffect(() => {
    if (profile?.username && !hasLoadedMedia) {
      loadMediaPosts(profile.username, null, false);
    }
  }, [profile?.username, hasLoadedMedia, loadMediaPosts]);

  const handleLoadMore = () => {
    if (profile?.username && mediaNextPage && !isLoadingMoreMedia) {
      const filters = hasActiveMediaFilters
        ? {
            search: mediaSearch.trim() || undefined,
            timestampStart: mediaDateFrom
              ? `${mediaDateFrom}T00:00:00`
              : undefined,
            timestampEnd: mediaDateTo ? `${mediaDateTo}T23:59:59.999999` : undefined,
          }
        : undefined;
      loadMediaPosts(profile.username, mediaNextPage, true, filters);
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
      <div className="space-y-6">
        <ProfileTabSearchBar
          search={mediaSearch}
          onSearchChange={setMediaSearch}
          dateFrom={mediaDateFrom}
          dateTo={mediaDateTo}
          onDateRangeChange={setMediaDateRange}
          onSearchSubmit={handleMediaSearchSubmit}
          onClear={clearMediaFilters}
          hasActiveFilters={hasActiveMediaFilters}
          placeholder="Buscar por palavra no texto ou legenda..."
        />
        <div className="text-center py-12 text-muted-foreground">
          Nenhum post com mídia encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileTabSearchBar
        search={mediaSearch}
        onSearchChange={setMediaSearch}
        dateFrom={mediaDateFrom}
        dateTo={mediaDateTo}
        onDateRangeChange={setMediaDateRange}
        onSearchSubmit={handleMediaSearchSubmit}
        onClear={clearMediaFilters}
        hasActiveFilters={hasActiveMediaFilters}
        placeholder="Buscar por palavra no texto ou legenda..."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaPosts.map((post) => (
          <MediaPostCard
            key={post.id}
            post={post}
            isOwner={isOwner}
            onClick={() => onPostClick(post.id)}
            onDelete={onDeletePost}
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
  isOwner,
  onClick,
  onDelete,
}: {
  post: PostProps;
  isOwner: boolean;
  onClick: () => void;
  onDelete?: (post: PostProps) => void;
}) {
  const firstMedia = post.medias?.[0];
  const mediaCount = post.medias?.length ?? 0;
  const isVideo = firstMedia?.media_type === "video";

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:shadow-card transition-all duration-200 relative"
      onClick={onClick}
    >
      {isOwner && onDelete && (
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm hover:bg-black/70 text-white border-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer"
                onClick={() => onDelete(post)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
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

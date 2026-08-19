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
import { Clock, Heart, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";
import type { PostProps } from "@/app/feed/types/PostProps";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";
import { ProfileTabSearchBar } from "./ProfileTabSearchBar";
import { MentionText } from "@/components/mentions/MentionText";

interface PostsTabProps {
  profile: getProfileByUsernameProps | null;
  isOwner?: boolean;
  onPostClick: (postId: string) => void;
  onDeletePost?: (post: PostProps) => void;
}

export function PostsTab({
  profile,
  isOwner = false,
  onPostClick,
  onDeletePost,
}: PostsTabProps) {
  const {
    textPosts,
    textNextPage,
    hasLoadedText,
    isLoadingText,
    isLoadingMoreText,
    loadTextPosts,
    textSearch,
    setTextSearch,
    textDateFrom,
    textDateTo,
    setTextDateRange,
    clearTextFilters,
    hasActiveTextFilters,
  } = useProfilePostsContext();

  const handleTextSearchSubmit = useCallback(
    (filters: {
      search: string | null;
      timestampStart: string | null;
      timestampEnd: string | null;
    }) => {
      if (!profile?.username) return;
      loadTextPosts(profile.username, null, false, {
        search: filters.search ?? undefined,
        timestampStart: filters.timestampStart ?? undefined,
        timestampEnd: filters.timestampEnd ?? undefined,
      });
    },
    [profile?.username, loadTextPosts]
  );

  useEffect(() => {
    if (profile?.username && !hasLoadedText) {
      loadTextPosts(profile.username, null, false);
    }
  }, [profile?.username, hasLoadedText, loadTextPosts]);

  const handleLoadMore = () => {
    if (profile?.username && textNextPage && !isLoadingMoreText) {
      const filters = hasActiveTextFilters
        ? {
            search: textSearch.trim() || undefined,
            timestampStart: textDateFrom
              ? `${textDateFrom}T00:00:00`
              : undefined,
            timestampEnd: textDateTo
              ? `${textDateTo}T23:59:59.999999`
              : undefined,
          }
        : undefined;
      loadTextPosts(profile.username, textNextPage, true, filters);
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
      <div className="space-y-6">
        <ProfileTabSearchBar
          search={textSearch}
          onSearchChange={setTextSearch}
          dateFrom={textDateFrom}
          dateTo={textDateTo}
          onDateRangeChange={setTextDateRange}
          onSearchSubmit={handleTextSearchSubmit}
          onClear={clearTextFilters}
          hasActiveFilters={hasActiveTextFilters}
          placeholder="Buscar por palavra no texto..."
        />
        <div className="text-center py-12 text-muted-foreground">
          Nenhum post de texto encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileTabSearchBar
        search={textSearch}
        onSearchChange={setTextSearch}
        dateFrom={textDateFrom}
        dateTo={textDateTo}
        onDateRangeChange={setTextDateRange}
        onSearchSubmit={handleTextSearchSubmit}
        onClear={clearTextFilters}
        hasActiveFilters={hasActiveTextFilters}
        placeholder="Buscar por palavra no texto..."
      />
      <div className="space-y-4">
        {textPosts.map((post) => (
          <TextPostCard
            key={post.id}
            post={post}
            isOwner={isOwner}
            onClick={() => onPostClick(post.id)}
            onDelete={onDeletePost}
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
  isOwner,
  onClick,
  onDelete,
}: {
  post: PostProps;
  isOwner: boolean;
  onClick: () => void;
  onDelete?: (post: PostProps) => void;
}) {
  const truncatedComment =
    post.comment && post.comment.length > 200
      ? post.comment.slice(0, 200) + "..."
      : post.comment;

  return (
    <Card
      className="hover:shadow-card transition-shadow duration-200 cursor-pointer relative z-0"
      onClick={onClick}
    >
      {isOwner && onDelete && (
        <div
          className="absolute top-3 right-3"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={2}
              className="min-w-[140px]"
              onOpenAutoFocus={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500 focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          <div className="flex flex-col gap-2 pr-8 sm:flex-row sm:items-start sm:justify-between">
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-foreground">
              {truncatedComment ? <MentionText text={truncatedComment} /> : "Sem legenda"}
            </p>
            <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground sm:text-sm">
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

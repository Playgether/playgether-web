"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, MessageCircle } from "lucide-react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { PostProps } from "@/app/feed/types/PostProps";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

async function fetchLikedPosts(cursor: string | null): Promise<{ data: PostProps[]; next_page: string | null }> {
  const params = new URLSearchParams({ page_size: "10" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/profile-liked-posts?${params.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao carregar posts curtidos");
  return res.json();
}

interface LikedPostsTabProps {
  onPostClick: (postId: number) => void;
}

export function LikedPostsTab({ onPostClick }: LikedPostsTabProps) {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (hasLoaded) return;
    setIsLoading(true);
    fetchLikedPosts(null)
      .then((res) => {
        setPosts(res.data);
        setNextPage(res.next_page);
        setHasLoaded(true);
      })
      .catch(() => setHasLoaded(true))
      .finally(() => setIsLoading(false));
  }, [hasLoaded]);

  const handleLoadMore = useCallback(async () => {
    if (!nextPage || isLoadingMore) return;
    let cursor: string | null = null;
    try {
      const url = nextPage.startsWith("http") ? nextPage : `http://dummy/${nextPage}`;
      cursor = new URL(url).searchParams.get("cursor");
    } catch {
      cursor = null;
    }
    if (!cursor) return;
    setIsLoadingMore(true);
    try {
      const res = await fetchLikedPosts(cursor);
      setPosts((prev) => [...prev, ...res.data]);
      setNextPage(res.next_page);
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextPage, isLoadingMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingComponent showText={false} className="h-8 w-8" />
      </div>
    );
  }

  if (hasLoaded && posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Heart className="w-10 h-10 opacity-30" />
        <p className="text-sm">Você ainda não curtiu nenhum post.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <LikedPostCard key={post.id} post={post} onClick={() => onPostClick(post.id)} />
      ))}
      {nextPage && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="hover:shadow-card transition-shadow duration-200"
          >
            {isLoadingMore ? (
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

function LikedPostCard({ post, onClick }: { post: PostProps; onClick: () => void }) {
  const truncated =
    post.comment && post.comment.length > 200
      ? post.comment.slice(0, 200) + "..."
      : post.comment;

  return (
    <Card
      className="hover:shadow-card transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar
            displayName={post.name ?? ""}
            username={post.username ?? ""}
            profilePhoto={post.profile_photo ?? null}
            sizeClass="h-8 w-8"
            fallbackTextClassName="text-xs"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground leading-none truncate">
              {post.name || post.username}
            </p>
            <p className="text-xs text-muted-foreground truncate">@{post.username}</p>
          </div>
          <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            <DateAndHour date={post.timestamp} />
          </span>
        </div>

        {truncated && (
          <p className="text-sm text-foreground leading-relaxed line-clamp-3">{truncated}</p>
        )}

        <div className="flex items-center gap-4 pt-1 border-t border-border">
          <div className="flex items-center gap-1.5 text-rose-500">
            <Heart className="h-4 w-4 fill-rose-500" />
            <span className="text-xs">{post.quantity_likes}</span>
          </div>
          <div
            className="flex items-center gap-1.5 text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.quantity_comment}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

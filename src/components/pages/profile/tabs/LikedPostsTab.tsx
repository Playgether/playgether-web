"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Heart, Images, MessageCircle, Play } from "lucide-react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { PostProps } from "@/app/feed/types/PostProps";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useProfilePostsContext } from "@/app/profile/context/ProfilePostsContext";
import { CldImage } from "next-cloudinary";
import { MentionText } from "@/components/mentions/MentionText";

async function fetchLikedPosts(cursor: string | null): Promise<{ data: PostProps[]; next_page: string | null }> {
  const params = new URLSearchParams({ page_size: "10" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/profile-liked-posts?${params.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Erro ao carregar posts curtidos");
  return res.json();
}

interface LikedPostsTabProps {
  onPostClick: (postId: string) => void;
}

export function LikedPostsTab({ onPostClick }: LikedPostsTabProps) {
  const { injectPost } = useProfilePostsContext();
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

  const handlePostClick = useCallback(
    (post: PostProps) => {
      injectPost(post);
      onPostClick(post.id);
    },
    [injectPost, onPostClick]
  );

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
        <LikedPostCard key={post.id} post={post} onClick={() => handlePostClick(post)} />
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

  const medias = post.medias ?? [];
  const mediaCount = medias.length;
  const firstMedia = medias[0];
  const hasMedia = Boolean(post.has_post_media && firstMedia);
  const isVideo =
    firstMedia?.media_type?.toLowerCase().includes("video") ||
    firstMedia?.file_format?.toLowerCase().includes("mp4") ||
    firstMedia?.file_format?.toLowerCase().includes("webm");

  const stats = (
    <div className="flex items-center gap-4">
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
  );

  return (
    <Card
      className="hover:shadow-card transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="space-y-2.5 p-3 sm:p-4">
        <div className="flex items-center gap-2.5">
          <ProfileAvatar
            displayName={post.name ?? ""}
            username={post.username ?? ""}
            profilePhoto={post.profile_photo ?? null}
            sizeClass="h-8 w-8"
            fallbackTextClassName="text-xs"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-none text-foreground">
              {post.name || post.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{post.username}</p>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <DateAndHour date={post.timestamp} />
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            {truncated ? (
              <p className="line-clamp-3 text-sm leading-snug text-foreground">
                <MentionText text={truncated} />
              </p>
            ) : hasMedia ? (
              <p className="text-xs italic text-muted-foreground">Post com mídia</p>
            ) : null}
            {stats}
          </div>

          {hasMedia && firstMedia ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              <CldImage
                src={firstMedia.media_file}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
              {isVideo ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                </div>
              ) : null}
              {mediaCount > 1 ? (
                <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 rounded bg-black/70 px-1 py-0.5 text-[10px] font-medium leading-none text-white">
                  <Images className="h-2.5 w-2.5" />
                  {mediaCount}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import type { PostProps } from "@/app/feed/types/PostProps";
import { Heart, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PostPageRecommendationsProps {
  currentPostId: number;
  authorUsername: string;
}

export function PostPageRecommendations({ currentPostId, authorUsername }: PostPageRecommendationsProps) {
  const [authorPosts, setAuthorPosts] = useState<PostProps[]>([]);
  const [feedPosts, setFeedPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [authorRes, feedRes] = await Promise.all([
          fetch(`/api/profile-posts?username=${encodeURIComponent(authorUsername)}&has_post_media=false&page_size=7`, { credentials: "include" }),
          api.get("/api/v1/feed/", { withCredentials: true }),
        ]);

        if (authorRes.ok) {
          const authorData = await authorRes.json();
          const posts: PostProps[] = authorData.data ?? [];
          setAuthorPosts(posts.filter((p) => p.id !== currentPostId).slice(0, 6));
        }

        const feedData: PostProps[] = Array.isArray(feedRes.data)
          ? feedRes.data
          : (feedRes.data?.results ?? []);
        setFeedPosts(
          feedData
            .filter((p) => p.id !== currentPostId && p.username !== authorUsername)
            .slice(0, 6)
        );
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPostId, authorUsername]);

  if (loading) {
    return (
      <div className="mt-6 space-y-8">
        <section>
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border/40 rounded-xl overflow-hidden p-3 space-y-3">
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (authorPosts.length === 0 && feedPosts.length === 0) return null;

  return (
    <div className="mt-6 space-y-8">
      {authorPosts.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Mais de @{authorUsername}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {authorPosts.map((post) => (
              <RecommendedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      {feedPosts.length > 0 && (
        <section className="pb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Posts para você
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {feedPosts.map((post) => (
              <RecommendedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RecommendedPostCard({ post }: { post: PostProps }) {
  const firstMedia = post.medias?.[0];
  const hasImage = firstMedia?.media_type === "image";

  return (
    <a href={`/feed/${post.id}`} className="group block">
      <div className="bg-background/80 border border-border/40 rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.1)] transition-all duration-200">
        {hasImage && firstMedia.media_file && (
          <div className="aspect-video overflow-hidden bg-black/20 relative">
            <ImageComponent
              media_id={firstMedia.media_file}
              alt="Post"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <ProfileAvatar
              displayName={post.name}
              username={post.username}
              profilePhoto={post.profile_photo}
              sizeClass="h-6 w-6"
              fallbackTextClassName="text-[10px]"
            />
            <span className="text-xs font-medium truncate">{post.name}</span>
            <span className="text-[11px] text-muted-foreground ml-auto shrink-0">
              <DateAndHour date={post.timestamp} />
            </span>
          </div>
          {post.comment && (
            <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed">
              {post.comment}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {post.quantity_likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {post.quantity_comment}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

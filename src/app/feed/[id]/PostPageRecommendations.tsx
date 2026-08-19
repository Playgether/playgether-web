"use client";

import { useEffect, useState } from "react";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import type { PostProps } from "@/app/feed/types/PostProps";
import { Heart, Images, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PostPageRecommendationsProps {
  currentPostId: string;
  authorUsername: string;
  /** Guests only see author posts — not personalized "Posts para você". */
  isGuest?: boolean;
}

async function fetchAuthorPosts(username: string, hasMedia: boolean) {
  const res = await fetch(
    `/api/profile-posts?username=${encodeURIComponent(username)}&has_post_media=${hasMedia}&page_size=7`,
    { credentials: "include" },
  );
  if (!res.ok) return [] as PostProps[];
  const data = await res.json();
  return (data.data ?? []) as PostProps[];
}

export function PostPageRecommendations({
  currentPostId,
  authorUsername,
  isGuest = false,
}: PostPageRecommendationsProps) {
  const [authorPosts, setAuthorPosts] = useState<PostProps[]>([]);
  const [feedPosts, setFeedPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const authorPromises = [
          fetchAuthorPosts(authorUsername, true),
          fetchAuthorPosts(authorUsername, false),
        ] as const;

        if (isGuest) {
          const [authorWithMedia, authorWithoutMedia] =
            await Promise.all(authorPromises);

          const authorById = new Map<string, PostProps>();
          for (const post of [...authorWithMedia, ...authorWithoutMedia]) {
            if (post.id !== currentPostId) authorById.set(post.id, post);
          }
          setAuthorPosts(Array.from(authorById.values()).slice(0, 6));
          setFeedPosts([]);
          return;
        }

        const [authorWithMedia, authorWithoutMedia, feedRes] =
          await Promise.all([
            ...authorPromises,
            fetch("/api/feed", { credentials: "include" }),
          ]);

        const authorById = new Map<string, PostProps>();
        for (const post of [...authorWithMedia, ...authorWithoutMedia]) {
          if (post.id !== currentPostId) authorById.set(post.id, post);
        }
        setAuthorPosts(Array.from(authorById.values()).slice(0, 6));

        if (feedRes.ok) {
          const feedData = await feedRes.json();
          const posts: PostProps[] = Array.isArray(feedData)
            ? feedData
            : (feedData?.data ?? feedData?.results ?? []);
          setFeedPosts(
            posts
              .filter(
                (p) => p.id !== currentPostId && p.username !== authorUsername,
              )
              .slice(0, 6),
          );
        }
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPostId, authorUsername, isGuest]);

  if (loading) {
    return (
      <div className="mt-6 space-y-8">
        <section>
          <Skeleton className="mb-3 h-4 w-32" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border/40 bg-card"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2 p-3">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="ml-auto h-3 w-12" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
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
      {authorPosts.length > 0 ? (
        <section>
          <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Mais de @{authorUsername}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {authorPosts.map((post) => (
              <RecommendedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}

      {feedPosts.length > 0 ? (
        <section className="pb-8">
          <h2 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Posts para você
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {feedPosts.map((post) => (
              <RecommendedPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** Mesma caixa com borda para todo post só-texto; curto centraliza, longo preenche. */
const SHORT_TEXT_MAX_CHARS = 60;
const TEXT_PREVIEW_MAX_CHARS = 140;

function truncatePreview(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}...`;
}

function TextOnlyCardPreview({ comment }: { comment?: string | null }) {
  const text = comment?.trim() ?? "";
  const isShort = text.length > 0 && text.length <= SHORT_TEXT_MAX_CHARS;
  const preview = text ? truncatePreview(text, TEXT_PREVIEW_MAX_CHARS) : "";

  return (
    <div className="relative flex h-full w-full flex-col bg-card px-4 py-3">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.18) 1px, transparent 0)",
          backgroundSize: "14px 14px",
        }}
        aria-hidden
      />
      <div className="relative mb-2 flex items-center justify-between gap-2">
        <span
          className="select-none font-serif text-3xl leading-none text-primary/35"
          aria-hidden
        >
          “
        </span>
        <span className="rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Texto
        </span>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {preview ? (
          <p
            className={
              isShort
                ? "line-clamp-4 max-w-[95%] rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2.5 text-center text-base font-semibold leading-snug text-foreground/95"
                : "line-clamp-5 w-full rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2.5 text-left text-sm font-medium leading-snug text-foreground/90"
            }
          >
            {preview}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Sem legenda</p>
        )}
      </div>
    </div>
  );
}

function RecommendedPostCard({ post }: { post: PostProps }) {
  const medias = post.medias ?? [];
  const firstMedia = medias[0];
  const hasMedia = Boolean(firstMedia?.media_file);
  const extraMediaCount = medias.length > 1 ? medias.length - 1 : 0;

  return (
    <a href={`/feed/${post.id}`} className="group flex h-full">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/40 bg-background/80 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_12px_rgba(139,92,246,0.1)]">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
          {hasMedia && firstMedia.media_type === "image" ? (
            <ImageComponent
              media_id={firstMedia.media_file}
              alt="Post"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : hasMedia ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-black/60 via-muted/40 to-black/40">
              <span className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90">
                Vídeo
              </span>
              {post.comment ? (
                <p className="line-clamp-2 max-w-[90%] px-2 text-center text-[11px] text-white/60">
                  {post.comment}
                </p>
              ) : null}
            </div>
          ) : (
            <TextOnlyCardPreview comment={post.comment} />
          )}

          {extraMediaCount > 0 ? (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              <Images className="h-3 w-3" />
              +{extraMediaCount}
            </span>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div className="mb-2 flex items-center gap-2">
            <ProfileAvatar
              displayName={post.name}
              username={post.username}
              profilePhoto={post.profile_photo}
              sizeClass="h-6 w-6"
              fallbackTextClassName="text-[10px]"
            />
            <span className="truncate text-xs font-medium">{post.name}</span>
            <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
              <DateAndHour date={post.timestamp} />
            </span>
          </div>
          {post.comment && hasMedia ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-foreground/70">
              {post.comment}
            </p>
          ) : null}
          <div className="mt-auto flex items-center gap-3 pt-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {post.quantity_likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {post.quantity_comment}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

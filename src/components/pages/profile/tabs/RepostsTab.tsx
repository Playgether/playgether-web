"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Clock, Heart, MessageCircle, MoreHorizontal, Repeat2, Trash2 } from "lucide-react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import type { getProfileByUsernameProps } from "@/services/getProfileByUsername";

interface OriginalPost {
  id: number;
  comment: string | null;
  timestamp: string;
  has_post_media: boolean;
  quantity_likes: number;
  quantity_comment: number;
  quantity_reposts: number;
  created_by_username: string;
  created_by_name: string;
  created_by_photo: string | null;
}

interface ProfileRepost {
  id: number;
  timestamp: string;
  comment: string | null;
  object_id: number;
  quantity_likes: number;
  quantity_comment: number;
  created_by_user_name: string;
  created_by_user_photo: string | null;
  original_post: OriginalPost | null;
}

interface RepostsTabProps {
  profile: getProfileByUsernameProps | null;
  isOwner?: boolean;
}

export function RepostsTab({ profile, isOwner = false }: RepostsTabProps) {
  const router = useRouter();
  const [reposts, setReposts] = useState<ProfileRepost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadReposts = useCallback(async () => {
    if (!profile?.username) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/profile-reposts?username=${encodeURIComponent(profile.username)}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setReposts(Array.isArray(data) ? data : []);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [profile?.username]);

  useEffect(() => {
    if (!hasLoaded) loadReposts();
  }, [hasLoaded, loadReposts]);

  const handleUndoRepost = useCallback(async (repostId: number) => {
    const res = await fetch(`/api/reposts/${repostId}`, { method: "DELETE" });
    if (res.ok) {
      setReposts((prev) => prev.filter((r) => r.id !== repostId));
    }
  }, []);

  if (!profile?.username) return null;

  if (isLoading && !hasLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingComponent showText={false} className="h-8 w-8" />
      </div>
    );
  }

  if (hasLoaded && reposts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum repost ainda.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reposts.map((repost) => (
        <RepostCard
          key={repost.id}
          repost={repost}
          isOwner={isOwner}
          onPostClick={(postId) => router.push(`/feed/${postId}`)}
          onUndoRepost={handleUndoRepost}
        />
      ))}
    </div>
  );
}

function RepostCard({
  repost,
  isOwner,
  onPostClick,
  onUndoRepost,
}: {
  repost: ProfileRepost;
  isOwner: boolean;
  onPostClick: (postId: number) => void;
  onUndoRepost: (repostId: number) => void;
}) {
  const post = repost.original_post;

  return (
    <Card className="hover:shadow-card transition-shadow duration-200">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat2 className="h-4 w-4 text-primary" />
            <span>Repostou</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <DateAndHour date={repost.timestamp} />
            </span>
          </div>
          {isOwner && (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[160px]">
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500 focus:bg-destructive/10 hover:bg-destructive/10 cursor-pointer"
                    onClick={() => onUndoRepost(repost.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Desfazer repost
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Repost caption */}
        {repost.comment && (
          <p className="text-sm text-foreground leading-relaxed">{repost.comment}</p>
        )}

        {/* Original post preview */}
        {post ? (
          <div
            className="rounded-lg border border-border bg-muted/20 p-4 cursor-pointer hover:bg-muted/30 transition-colors space-y-2"
            onClick={() => onPostClick(post.id)}
          >
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                {post.created_by_name || post.created_by_username}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground flex items-center gap-1">
                <DateAndHour date={post.timestamp} />
              </span>
            </div>
            {post.comment && (
              <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                {post.comment}
              </p>
            )}
            {post.has_post_media && !post.comment && (
              <p className="text-xs text-muted-foreground italic">Contém mídia</p>
            )}
            <div className="flex items-center gap-4 pt-1 border-t border-border/50">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3" />
                {post.quantity_likes}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="h-3 w-3" />
                {post.quantity_comment}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Repeat2 className="h-3 w-3" />
                {post.quantity_reposts}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground italic">
            Post original não disponível.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

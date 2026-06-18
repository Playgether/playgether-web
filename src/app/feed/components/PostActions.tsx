"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { useFeedContext } from "../context/FeedContext";
import { PostProps } from "../types/PostProps";
import { LikeContentType } from "@/components/content_types/LikeContentType";
import { PostPropertiers } from "@/components/layouts/components/PostsPropertiersQuantity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PenLine, Repeat2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomToast } from "@/components/ui/customSonner";

function formatCount(n: number) {
  if (n >= 1000000) {
    const f = (Math.floor(n / 100000) / 10).toFixed(1).replace(".", ",");
    return f.endsWith(",0") ? f.slice(0, -2) + "mi" : f + "mi";
  }
  if (n >= 1000) {
    const f = (Math.floor(n / 100) / 10).toFixed(1).replace(".", ",");
    return f.endsWith(",0") ? f.slice(0, -2) + "mil" : f + "mil";
  }
  return n;
}

export default function PostActions({
  post,
  handleShareModal,
}: {
  post: PostProps;
  handleShareModal: () => void;
}) {
  const { Feed } = useFeedServerContext();
  const { handleLike, handleRepost } = useFeedContext();
  const [isReposting, setIsReposting] = useState(false);

  const onClickLike = () => handleLike(post.id);

  const handleQuickRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isReposting) return;
    setIsReposting(true);
    try {
      const res = await fetch("/api/reposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: post.id }),
      });
      if (res.ok) {
        const data = await res.json();
        handleRepost(post.id, data.id);
        CustomToast.success("Post repostado!");
      } else {
        const data = await res.json();
        CustomToast.error(data.detail || "Erro ao repostar.");
      }
    } catch {
      CustomToast.error("Erro ao repostar.");
    } finally {
      setIsReposting(false);
    }
  };

  const handleUndoRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!post.user_repost_id || isReposting) return;
    setIsReposting(true);
    try {
      const res = await fetch(`/api/reposts/${post.user_repost_id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        handleRepost(post.id, null);
        CustomToast.neutral("Repost desfeito.");
      } else {
        CustomToast.error("Erro ao desfazer repost.");
      }
    } catch {
      CustomToast.error("Erro ao desfazer repost.");
    } finally {
      setIsReposting(false);
    }
  };

  const handleRepostWithComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleShareModal();
  };

  return (
    <>
      <PostPropertiers.Root className="">
        <PostPropertiers.Like
          quantitylikesNumber={post.quantity_likes}
          clicked={post.user_already_like}
          object_id={post.id}
          content_type={LikeContentType.post}
          onAddLike={onClickLike}
          onDeleteLike={onClickLike}
        />
        <PostPropertiers.Comment quantity_comment={post.quantity_comment} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
              }}
              className={cn(
                "text-muted-foreground hover:text-primary p-2",
                post.user_repost_id && "text-primary"
              )}
            >
              <Repeat2 className="w-5 h-5 mr-2" />
              {formatCount(post.quantity_reposts)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-background/95 backdrop-blur-xl border border-border/50"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {post.user_repost_id ? (
              <DropdownMenuItem
                onClick={handleUndoRepost}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                disabled={isReposting}
              >
                <X className="w-4 h-4 mr-2" />
                Desfazer repost
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem
                  onClick={handleQuickRepost}
                  disabled={isReposting}
                >
                  <Repeat2 className="w-4 h-4 mr-2" />
                  Repostar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRepostWithComment}>
                  <PenLine className="w-4 h-4 mr-2" />
                  Repostar com comentário
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </PostPropertiers.Root>
    </>
  );
}

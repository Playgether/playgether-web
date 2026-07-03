"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { useFeedServerContext } from "../context/FeedServerContext";
import RepostFlag from "./RepostFlag";
import ContextMenuOwn from "./ContextMenuOwn";
import ContextMenuNotMine from "./ContextMenuNotMine";
import ContextMenuAction from "./ContextMenuAction";
import PostText from "./PostText";
import PostActions from "./PostActions";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";
import { HighlightedAchievementBadges } from "@/components/achievements/HighlightedAchievementBadges";
import { ShareModal } from "./ShareModal";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import VideoComponent from "@/components/layouts/VideoComponent/VideoComponent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFeedContext } from "../context/FeedContext";
import { CustomToast } from "@/components/ui/customSonner";

export const FeedPost = ({ post }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertAction, setAlertAction] = useState<string>("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { Feed } = useFeedServerContext();
  const components = Feed.ServerFeedPost.components;
  const router = useRouter();
  const { getPostById, handlePostUpdate } = useFeedContext();
  // const post = getPostById(initialPostId);

  const handleShareModal = useCallback((action?: boolean) => {
    action ? setShareModalOpen(action) : setShareModalOpen((prev) => !prev);
  }, []);

  const handleContextAction = async (action: string) => {
    if (action === "toggle_comments") {
      const newState = !post.comments_disabled;
      try {
        const res = await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comments_disabled: newState }),
        });
        if (res.ok) {
          handlePostUpdate({ ...post, comments_disabled: newState }, post.id);
          CustomToast.neutral(newState ? "Comentários desativados." : "Comentários ativados.");
        } else {
          CustomToast.error("Erro ao alterar configuração de comentários.");
        }
      } catch {
        CustomToast.error("Erro ao alterar configuração de comentários.");
      }
      return;
    }
    setAlertAction(action);
    setAlertOpen(true);
  };

  const confirmAction = async () => {
    setAlertOpen(false);

    if (alertAction === "delete") {
      try {
        const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
        if (res.ok || res.status === 204) {
          handlePostUpdate(null, post.id);
          CustomToast.success("Post deletado com sucesso.");
        } else {
          CustomToast.error("Erro ao deletar post. Tente novamente.");
        }
      } catch {
        CustomToast.error("Erro ao deletar post. Tente novamente.");
      }
      return;
    }

    if (alertAction === "remove") {
      handlePostUpdate(null, post.id);
      CustomToast.neutral("Post removido do seu feed.");
      return;
    }

    if (alertAction === "block") {
      try {
        await fetch(`/api/profiles/${post.username}/block`, { method: "POST" });
      } catch {
        // falha silenciosa — o post já some do feed
      }
      handlePostUpdate(null, post.id);
      CustomToast.info("Usuário bloqueado. Você não verá mais posts dele.");
      return;
    }

    if (alertAction === "mute") {
      try {
        await fetch(`/api/profiles/${post.username}/mute`, { method: "POST" });
      } catch {
        // falha silenciosa — o post já some do feed
      }
      handlePostUpdate(null, post.id);
      CustomToast.neutral("Usuário silenciado. Os posts dele não aparecerão mais.");
      return;
    }

    if (alertAction === "report") {
      try {
        await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content_type: "post",
            object_id: post.id,
            reason: "other",
          }),
        });
        CustomToast.warning("Denúncia enviada. Nossa equipe irá analisar o post.");
      } catch {
        CustomToast.error("Erro ao enviar denúncia. Tente novamente.");
      }
      return;
    }
  };

  const handlePostClick = () => {
    router.push(`/feed/${post?.id}`);
  };

  return (
    <Card className="relative mb-3 animate-fade-up border-border/50 bg-card backdrop-blur-sm transition-all duration-300 hover:cursor-pointer hover:border-primary/40 hover:shadow-glow-primary/30 sm:mb-5 lg:mb-7 lg:hover:scale-[1.02]">
      <CardContent className="relative p-3 sm:p-5 lg:p-6">
        {post && (
          <>
            <Link
              href={`/feed/${post.id}`}
              scroll={false}
              className="absolute inset-0 z-0 rounded-[inherit]"
              aria-label={`Abrir post de ${post.name}`}
              tabIndex={-1}
            />
            <div className="relative z-[1] pointer-events-none">
            {/* Repost Header */}
            {post.isRepost && (
              <div className="pointer-events-none">
                <RepostFlag post={post} />
              </div>
            )}
            {/* Header */}
            <div className="mb-3 flex min-w-0 items-center justify-between gap-2 sm:mb-4">
              <div className="flex min-w-0 flex-1 items-center space-x-2.5 sm:space-x-3">
                <div className="pointer-events-none shrink-0">
                  <ProfileAvatar
                    displayName={post.name}
                    username={post.username}
                    profilePhoto={post.profile_photo}
                    sizeClass="h-10 w-10 sm:h-12 sm:w-12"
                    ringClass="ring-2 ring-primary/20"
                    fallbackTextClassName="text-sm"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  {/* Desktop — tags inline com o nome (layout original) */}
                  <div className="hidden min-w-0 lg:block">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="inline-flex min-w-0 max-w-full shrink-0 items-center gap-2">
                        <h3
                          className="pointer-events-auto inline-block w-fit max-w-full min-w-0 font-semibold text-foreground"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/profile/${post.username}`);
                          }}
                        >
                          {post.name}
                        </h3>
                        {post.verified && (
                          <span className="inline-flex shrink-0">
                            {components.VerifiedProfile}
                          </span>
                        )}
                      </div>
                      <HighlightedAchievementBadges
                        achievements={post.highlighted_achievements}
                        className="pointer-events-auto relative z-10 min-w-0"
                      />
                    </div>
                    <p className="pointer-events-none text-sm text-muted-foreground">
                      @{post.username} • <DateAndHour date={post.timestamp} />
                    </p>
                  </div>

                  {/* Mobile — tags em linha própria, compactas */}
                  <div className="min-w-0 lg:hidden">
                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                      <h3
                        className="pointer-events-auto min-w-0 truncate font-semibold text-foreground"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          router.push(`/profile/${post.username}`);
                        }}
                      >
                        {post.name}
                      </h3>
                      {post.verified && (
                        <span className="inline-flex shrink-0">
                          {components.VerifiedProfile}
                        </span>
                      )}
                    </div>
                    <HighlightedAchievementBadges
                      achievements={post.highlighted_achievements}
                      className="pointer-events-auto relative z-20 mt-1.5"
                      compact
                    />
                    <p className="pointer-events-none mt-1 truncate text-sm text-muted-foreground">
                      @{post.username} • <DateAndHour date={post.timestamp} />
                    </p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <div className="pointer-events-auto">
                {components.MoreOptions}
                <DropdownMenuContent
                  align="end"
                  className="bg-background/95 backdrop-blur-xl border border-border/50"
                >
                  {(post.is_own || post.isOwn) ? (
                    <ContextMenuOwn
                      handleContextAction={handleContextAction}
                      commentsDisabled={post.comments_disabled}
                    />
                  ) : (
                    <ContextMenuNotMine
                      handleContextAction={handleContextAction}
                    />
                  )}
                </DropdownMenuContent>
                </div>
              </DropdownMenu>
            </div>

            {/* Content */}
            <PostText handlePostClick={handlePostClick} post={post} />

            {/* Media */}
            {post.medias && post.medias.length > 0 && (
              <div
                className={cn(
                  "pointer-events-auto mb-3 h-40 overflow-hidden rounded-lg sm:mb-4 sm:h-48 sm:rounded-xl lg:h-64",
                  post.medias.length === 1
                    ? "grid grid-cols-1"
                    : "grid grid-cols-2 gap-2"
                )}
              >
                {post.medias.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer overflow-hidden"
                    onClick={handlePostClick}
                  >
                    {item.media_type === "image" ? (
                      <ImageComponent
                        media_id={item.media_file}
                        alt="Post media"
                        className={`h-40 w-full object-cover transition-transform duration-300 sm:h-48 lg:h-64 ${
                          post.medias.length < 2 && "group-hover:scale-105"
                        }`}
                      />
                    ) : (
                      <div className="relative video-container">
                        <VideoComponent
                          media_id={item.media_file}
                          className="h-40 w-full object-cover sm:h-48 lg:h-64"
                          preload="metadata"
                          style={{
                            background:
                              "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)",
                            filter:
                              "hue-rotate(10deg) saturate(1.1) brightness(1.05)",
                          }}
                        />
                      </div>
                    )}
                    {post.medias.length > 2 && index === 1 && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
                        <div className="text-center">
                          <span className="text-white text-3xl font-bold">
                            +{post.medias.length - 2}
                          </span>
                          {components.MoreMediasParagraph}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pointer-events-auto flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 sm:pt-4">
              <div className="flex items-center space-x-2 sm:space-x-6">
                <PostActions post={post} handleShareModal={handleShareModal} />
              </div>
            </div>
            </div>
          </>
        )}
      </CardContent>

      <ShareModal
        post={post}
        handleShareModal={handleShareModal}
        shareModalOpen={shareModalOpen}
      />
      <ContextMenuAction
        alertAction={alertAction}
        alertOpen={alertOpen}
        confirmAction={confirmAction}
        setAlertOpen={setAlertOpen}
      />
    </Card>
  );
};

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
import { ShareModal } from "./ShareModal";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import VideoComponent from "@/components/layouts/VideoComponent/VideoComponent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFeedContext } from "../context/FeedContext";

export const FeedPost = ({ post }) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertAction, setAlertAction] = useState<string>("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { Feed } = useFeedServerContext();
  const components = Feed.ServerFeedPost.components;
  const router = useRouter();
  const { getPostById } = useFeedContext();
  // const post = getPostById(initialPostId);

  const handleShareModal = useCallback((action?: boolean) => {
    action ? setShareModalOpen(action) : setShareModalOpen((prev) => !prev);
  }, []);

  const handleContextAction = (action: string) => {
    setAlertAction(action);
    setAlertOpen(true);
  };

  const confirmAction = () => {
    // All actions remove the post from feed
    window.history.back();
    setAlertOpen(false);
  };

  const handlePostClick = () => {
    router.push(`/feed/${post?.id}`);
  };

  return (
    <Card className="bg-card border-border/50 backdrop-blur-sm hover:shadow-glow-primary/30 hover:scale-[1.02] hover:border-primary/40 transition-all duration-300 animate-fade-up hover:cursor-pointer mb-7">
      <CardContent className="p-6">
        {post && (
          <Link href={`/feed/${post.id}`} scroll={false}>
            {/* Repost Header */}
            {post.isRepost && <RepostFlag post={post} />}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 ring-2 ring-primary/20 rounded-full overflow-hidden">
                  {post.profile_photo ? (
                    <div className="relative w-full h-full">
                      <ImageComponent
                        media_id={post.profile_photo}
                        alt={`Profile photo of the user ${post?.username}`}
                        className="object-cover rounded-full"
                      />
                    </div>
                  ) : (
                    components.NoImageProfile
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3
                      className="font-semibold text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/profile/${post.username}`);
                      }}
                    >
                      {/* {(post.isRepost ? post.originalPost?.user : post.user).name} */}
                      {post.name}
                    </h3>
                    {/* {(post.isRepost ? post.originalPost?.user : post.user)
                  .verified && components.VerifiedProfile} */}
                    {post.verified && components.VerifiedProfile}
                  </div>
                  {/* <p className="text-sm text-muted-foreground">
                @
                {(post.isRepost ? post.originalPost?.user : post.user).username}{" "}
                • {(post.isRepost ? post.originalPost : post).timestamp}
              </p> */}
                  <p className="text-sm text-muted-foreground">
                    @{post.username} • <DateAndHour date={post.timestamp} />
                  </p>
                </div>
              </div>
              <DropdownMenu>
                {components.MoreOptions}
                <DropdownMenuContent
                  align="end"
                  className="bg-background/95 backdrop-blur-xl border border-border/50"
                >
                  {post.isOwn ? (
                    <ContextMenuOwn handleContextAction={handleContextAction} />
                  ) : (
                    <ContextMenuNotMine
                      handleContextAction={handleContextAction}
                    />
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content */}
            <PostText handlePostClick={handlePostClick} post={post} />

            {/* Media */}
            {post.medias && post.medias.length > 0 && (
              <div
                className={cn(
                  "mb-4 rounded-xl overflow-hidden  h-64",
                  post.medias.length === 1
                    ? "grid grid-cols-1"
                    : "grid grid-cols-2 gap-2"
                )}
              >
                {post.medias.slice(0, 2).map((item, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={handlePostClick}
                  >
                    {item.media_type === "image" ? (
                      <ImageComponent
                        media_id={item.media_file}
                        alt="Post media"
                        className={`w-full h-64 object-cover transition-transform duration-300 ${
                          post.medias.length < 2 && "group-hover:scale-105"
                        }`}
                      />
                    ) : (
                      <div className="relative video-container">
                        <VideoComponent
                          media_id={item.media_file}
                          className="w-full h-64 object-cover rounded-lg"
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
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl z-10">
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
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center space-x-6">
                <PostActions post={post} handleShareModal={handleShareModal} />
              </div>
            </div>
          </Link>
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

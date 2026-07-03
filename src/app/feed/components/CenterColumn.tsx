"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useCallback } from "react";
import { useFeedContext } from "../context/FeedContext";
import { Virtuoso } from "react-virtuoso";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { FeedPost } from "./FeedPost";
import { FeedTabs } from "./FeedTabs";
import { FeedEmptyState } from "./FeedEmptyState";
import { FollowSuggestionsCard } from "./FollowSuggestionsCard";
import { ActiveRoomsCard } from "./ActiveRoomsCard";

export default function CenterColumn() {
  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleCreatePostModal,
    posts,
    feedMode,
    setFeedMode,
    isFeedLoading,
  } = useFeedContext();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const showEmpty =
    !isFeedLoading && !isFetchingNextPage && posts.length === 0;

  return (
    <div className="relative col-span-6 space-y-6">
      <FeedTabs mode={feedMode} onChange={setFeedMode} />

      <div className="space-y-4 lg:hidden">
        <FollowSuggestionsCard />
        <ActiveRoomsCard />
      </div>

      <div className="mb-3 lg:hidden">
        <Button
          onClick={() => handleCreatePostModal(true)}
          variant="outline"
          className="h-11 w-full justify-start gap-2 rounded-full border-border/60 bg-muted/30 px-4 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/50 hover:text-foreground"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-primary">
            <Plus className="h-4 w-4 text-white" />
          </span>
          Compartilhe algo conosco
        </Button>
      </div>

      <div className="mb-6 hidden lg:block">
        <Button
          onClick={() => handleCreatePostModal(true)}
          className="h-14 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl lg:h-16 lg:text-lg"
        >
          <Plus className="mr-2 h-5 w-5 lg:mr-3 lg:h-6 lg:w-6" />
          Compartilhe algo conosco
        </Button>
      </div>

      <div className="relative flex flex-col gap-6 lg:gap-[70px]">
        {isFeedLoading ? (
          <LoadingComponent text="Carregando feed..." showText />
        ) : showEmpty ? (
          <FeedEmptyState
            mode={feedMode}
            onCreatePost={() => handleCreatePostModal(true)}
          />
        ) : (
          <Virtuoso
            useWindowScroll
            increaseViewportBy={200}
            overscan={3}
            data={posts}
            endReached={loadMore}
            itemContent={(index, post) => (
              <div key={post.id} style={{ animationDelay: `${index * 200}ms` }}>
                <FeedPost post={post} />
              </div>
            )}
          />
        )}
        {isFetchingNextPage && (
          <div className="z-40 mt-[30px] h-fit w-full">
            <LoadingComponent text="Carregando novos posts" showText={true} />
          </div>
        )}
      </div>
    </div>
  );
}

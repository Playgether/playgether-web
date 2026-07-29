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
import { FeedListFooter } from "./FeedListFooter";

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
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const showEmpty =
    !isFeedLoading && !isFetchingNextPage && posts.length === 0;

  return (
    <div className="relative col-span-6 space-y-6">
      <div className="mb-3 lg:mb-6">
        <Button
          onClick={() => handleCreatePostModal(true)}
          variant="outline"
          className="h-11 w-full justify-start gap-2 rounded-full border-border/60 bg-muted/60 px-4 text-sm font-medium text-muted-foreground shadow-none hover:bg-muted/80 hover:text-foreground lg:h-14 lg:gap-3 lg:px-6 lg:text-base"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-primary lg:h-9 lg:w-9">
            <Plus className="h-4 w-4 text-white lg:h-5 lg:w-5" />
          </span>
          Compartilhe algo conosco
        </Button>
      </div>

      <FeedTabs mode={feedMode} onChange={setFeedMode} />

      <div className="relative flex flex-col">
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
            atBottomThreshold={400}
            data={posts}
            endReached={loadMore}
            components={{ Footer: FeedListFooter }}
            itemContent={(_index, post) => <FeedPost post={post} />}
          />
        )}
      </div>
    </div>
  );
}

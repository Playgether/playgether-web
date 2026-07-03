"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React, { useCallback } from "react";
import { useFeedContext } from "../context/FeedContext";
import { Virtuoso } from "react-virtuoso";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import { FeedPost } from "./FeedPost";

export default function CenterColumn() {
  const {
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    handleCreatePostModal,
    posts,
  } = useFeedContext();
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  return (
    <div className="col-span-6 relative space-y-6">
      {/* Composer — mobile (topo do feed) */}
      <div className="mb-4 lg:hidden">
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
      {/* Composer — desktop */}
      <div className="mb-6 hidden lg:block">
        <Button
          onClick={() => handleCreatePostModal(true)}
          className="h-14 w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl lg:h-16 lg:text-lg"
        >
          <Plus className="mr-2 h-5 w-5 lg:mr-3 lg:h-6 lg:w-6" />
          Compartilhe algo conosco
        </Button>
      </div>
      <div className="relative flex flex-col gap-10 lg:gap-[70px]">
        <Virtuoso
          useWindowScroll
          style={{ height: "100%" }}
          increaseViewportBy={200}
          overscan={3}
          data={posts}
          endReached={loadMore}
          itemContent={(index, post) => (
            <div key={post.id} style={{ animationDelay: `${index * 200}ms` }}>
              {/* {React.cloneElement(FeedPost, { post })} */}
              {/* <FeedPost initialPostId={post.id} /> */}
              <FeedPost post={post} />
            </div>
          )}
        />
        {isFetchingNextPage && (
          <div className="h-fit w-full z-40 mt-[30px]">
            <LoadingComponent text="Carregando novos posts" showText={true} />
          </div>
        )}
      </div>
    </div>
  );
}

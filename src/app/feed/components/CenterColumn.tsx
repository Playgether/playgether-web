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
    <div className="col-span-6 space-y-6 relative">
      {/* Create Post Button */}
      <div className="mb-6">
        <Button
          onClick={() => handleCreatePostModal(true)}
          className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-6 h-6 mr-3" />
          Compartilhe algo conosco
        </Button>
      </div>
      <div className="flex flex-col gap-[70px] relative">
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

"use client";
import React from "react";
import InfiniteScrollFallback from "../MultUseComponents/InfiniteScroll/InfiniteScrollFallback";
import FinishFeed from "../MultUseComponents/FinishFeed";
import { useFeedContext } from "@/context/FeedContext";

function MiddleIsFetching() {
  const { hasNextPage, isFetchingNextPage } = useFeedContext();
  return (
    <>
      {isFetchingNextPage && (
        <InfiniteScrollFallback
          message={"Estamos carregando mais posts para você"}
          className="w-5/6 h-24 p-5 mt-[100px]"
        />
      )}
      {!hasNextPage ? <FinishFeed /> : null}
    </>
  );
}

export default MiddleIsFetching;

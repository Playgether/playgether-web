"use client";

import FeedComponent from "./FeedComponent";
import FinishFeed from "../MultUseComponents/FinishFeed";
import { UploadCompoent } from "./Upload/UploadComponent";
import { useFeedContext } from "@/context/FeedContext";
import InfiniteScrollFallback from "../MultUseComponents/InfiniteScroll/InfiniteScrollFallback";

const Middle = () => {
  const { hasNextPage, isFetchingNextPage } = useFeedContext();

  return (
    <div className="h-full mt-4 pb-14 shadow-lg space-y-4 Middle-wrapper">
      <UploadCompoent />
      <FeedComponent />
      {isFetchingNextPage && (
        <InfiniteScrollFallback
          message={"Estamos carregando mais posts para você"}
          className="w-5/6 h-24 p-5 mt-[100px]"
        />
      )}
      {!hasNextPage ? <FinishFeed /> : null}
    </div>
  );
};
export default Middle;

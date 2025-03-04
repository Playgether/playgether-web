"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { FeedProps } from "@/types/FeedProps";
import { getFeed } from "@/actions/getFeed";

type FeedContextProps = {
  feed: FeedProps[] | undefined;
  alterCommentQuantity: (post_id: number) => void;
  subtractCommentQuantity: (post_id: number) => void;
  fetchNextPage: (options?: FetchNextPageOptions | undefined) => Promise<
    InfiniteQueryObserverResult<
      InfiniteData<
        {
          data: any;
          next_page: any;
        },
        unknown
      >,
      Error
    >
  >;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
};

const FeedContext = createContext<FeedContextProps>({} as FeedContextProps);

const FeedContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const [feed, setFeed] = useState<FeedProps[] | []>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed-posts"],
      queryFn: ({ pageParam }) => getFeed(pageParam),
      getNextPageParam: (lastPage) => {
        if (lastPage?.next_page) {
          const url = new URL(lastPage.next_page);
          return url.searchParams.get("cursor");
        }
        return null;
      },
      enabled: !!user,
      initialPageParam: null,
    });

  const alterCommentQuantity = (post_id: number) => {
    if (!feed) return;

    const postIndex = feed.findIndex((post) => post.id === post_id);

    if (postIndex !== -1) {
      const updatedFeed = [...feed];
      const post = { ...updatedFeed[postIndex] };
      post.quantity_comment += 1;
      updatedFeed[postIndex] = post;

      setFeed(updatedFeed);
    }
  };

  const subtractCommentQuantity = (post_id: number) => {
    if (!feed) return;

    const postIndex = feed.findIndex((post) => post.id === post_id);

    if (postIndex !== -1) {
      const updatedFeed = [...feed];
      const post = { ...updatedFeed[postIndex] };
      post.quantity_comment -= 1;
      updatedFeed[postIndex] = post;

      setFeed(updatedFeed);
    }
  };

  useEffect(() => {
    setFeed(data?.pages?.flatMap((page) => page.data) || []);
  }, [data]);

  return (
    <FeedContext.Provider
      value={{
        feed,
        alterCommentQuantity,
        subtractCommentQuantity,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = () => useContext(FeedContext);
export { FeedContextProvider };

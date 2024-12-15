"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import { FeedProps, getFeed } from "../services/getFeed";
import { useProfileContext } from "./ProfileContext";
import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
  useInfiniteQuery,
} from "@tanstack/react-query";

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
  const { authTokens, user } = useAuthContext();
  const { profile } = useProfileContext();
  const [feed, setFeed] = useState<FeedProps[] | []>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["feed-posts", user?.user_id, profile?.id],
      queryFn: ({ pageParam }) => getFeed(authTokens, user?.user_id, pageParam),
      getNextPageParam: (lastPage) => {
        if (lastPage?.next_page) {
          const url = new URL(lastPage.next_page);
          return url.searchParams.get("cursor");
        }
        return null;
      },
      enabled: !!authTokens && !!profile?.id,
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

  const cleanFeed = () => {
    setFeed([]);
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

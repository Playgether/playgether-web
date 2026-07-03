"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useCreatePostContext } from "@/context/CreatePostContext";
import { PostProps } from "../types/PostProps";
import { FeedContextType } from "./FeedContextType";
import { ResponseFeed } from "../types/ResponseFeed";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { getFeedClient } from "../services/getFeedClient";
import type { FeedMode } from "../types/FeedMode";

// Criando o contexto
export const FeedContext = createContext<FeedContextType | undefined>(undefined);

// Hook de acesso
export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext deve ser usado dentro de um FeedProvider");
  }
  return context;
};

// Provider
export const FeedProvider = ({
  children,
  response,
}: {
  children: React.ReactNode;
  response: ResponseFeed;
}) => {
  const [posts, setPosts] = useState<PostProps[]>(response.data);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [feedMode, setFeedModeState] = useState<FeedMode>("following");
  const { user } = useAuthContext();

  const setFeedMode = useCallback((mode: FeedMode) => {
    setFeedModeState(mode);
    setPosts([]);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ["feed-posts", feedMode],
    queryFn: ({ pageParam }) => getFeedClient(pageParam, feedMode),
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

  const isFeedLoading = (isPending || isFetching) && !isFetchingNextPage;

  useEffect(() => {
    if (data?.pages) {
      const merged = data.pages.flatMap((page) => page.data ?? []);
      setPosts(merged);
    }
  }, [data]);

  useEffect(() => {
    if (feedMode === "following" && !data?.pages?.length && response.data.length > 0) {
      setPosts(response.data);
    }
  }, [feedMode, data, response.data]);

  const handlePostCreated = useCallback((newPost: PostProps) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      handlePostCreated(e.detail);
    };
    window.addEventListener("post-created", handler as EventListener);
    return () =>
      window.removeEventListener("post-created", handler as EventListener);
  }, [handlePostCreated]);

  const globalCreatePost = useCreatePostContext();
  const handleCreatePostModal = useCallback(
    (argument: boolean) => {
      setCreatePostOpen(argument);
      globalCreatePost?.handleCreatePostModal(argument);
    },
    [globalCreatePost]
  );

  const handleRepost = useCallback((postId: number, repostId: number | null) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (repostId === null) {
          return { ...p, quantity_reposts: Math.max(0, p.quantity_reposts - 1), user_repost_id: null };
        }
        return { ...p, quantity_reposts: p.quantity_reposts + 1, user_repost_id: repostId };
      })
    );
  }, []);

  const getPostById = (postId: number) => {
    return posts.find((p) => p.id === postId);
  };

  const injectPost = useCallback((post: PostProps) => {
    setPosts((prev) => {
      if (prev.find((p) => p.id === post.id)) return prev;
      return [post, ...prev];
    });
  }, []);

  const increaseCommentCount = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, quantity_comment: p.quantity_comment + 1 } : p
      )
    );
  };

  const decreaseCommentCount = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, quantity_comment: p.quantity_comment - 1 } : p
      )
    );
  };

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_already_like: !p.user_already_like,
              quantity_likes: p.user_already_like
                ? p.quantity_likes - 1
                : p.quantity_likes + 1,
            }
          : p
      )
    );
  };

  const handlePostUpdate = useCallback(
    (updatedPost: PostProps | null, postId: number) => {
      if (updatedPost === null) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? ({ ...p, isRemoving: true } as PostProps & {
                  isRemoving: boolean;
                })
              : p
          )
        );
        setTimeout(() => {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }, 300);
      } else {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p))
        );
      }
    },
    []
  );

  return (
    <FeedContext.Provider
      value={{
        posts,
        feedMode,
        setFeedMode,
        isFeedLoading,
        handlePostCreated,
        handleRepost,
        handlePostUpdate,
        createPostOpen,
        handleCreatePostModal,
        handleLike,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        getPostById,
        increaseCommentCount,
        decreaseCommentCount,
        injectPost,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

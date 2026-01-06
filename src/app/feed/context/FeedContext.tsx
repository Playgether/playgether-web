"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { PostProps } from "../types/PostProps";
import { FeedContextType } from "./FeedContextType";
import { ResponseFeed } from "../types/ResponseFeed";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { getFeedClient } from "../services/getFeedClient";

// Criando o contexto
const FeedContext = createContext<FeedContextType | undefined>(undefined);

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
  const { user } = useAuthContext();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["feed-posts"],
      queryFn: ({ pageParam }) => getFeedClient(pageParam),
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

  useEffect(() => {
    if (data?.pages) {
      const merged = data.pages.flatMap((page) => page.data ?? []);
      setPosts(merged);
    }
  }, [data]);

  const handleCreatePostModal = (argument: boolean) => {
    setCreatePostOpen(argument);
  };

  const handlePostCreated = useCallback((newPost: PostProps) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const handleRepost = useCallback((postId: number, repost: PostProps) => {
    setPosts((prev) => {
      // atualiza o post original (incrementa o contador)
      const updated = prev.map((p) =>
        p.id === postId ? { ...p, quantity_reposts: p.quantity_reposts + 1 } : p
      );

      // adiciona o repost no topo
      return [repost, ...updated];
    });
  }, []);

  const getPostById = (postId: number) => {
    return posts.find((p) => p.id === postId);
  };

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
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useCreatePostContext } from "@/context/CreatePostContext";
import { PostProps } from "../types/PostProps";
import { FeedContextType } from "./FeedContextType";
import { ResponseFeed } from "../types/ResponseFeed";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthContext";
import { useProfileContext } from "@/context/ProfileContext";
import { getFeedClient } from "../services/getFeedClient";
import { parseFeedCursor } from "../utils/parseFeedCursor";
import type { FeedMode } from "../types/FeedMode";

export const FeedContext = createContext<FeedContextType | undefined>(undefined);

export const useFeedContext = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeedContext deve ser usado dentro de um FeedProvider");
  }
  return context;
};

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
  const userPickedTabRef = useRef(false);
  const initialRedirectDoneRef = useRef(false);
  const { user, authSessionResolved } = useAuthContext();
  const { profile, fetchProfile } = useProfileContext();

  const followingCount = useMemo(() => {
    if (!profile || !Array.isArray(profile.follows)) return 0;
    return profile.follows.filter((followedId) => followedId !== profile.id)
      .length;
  }, [profile]);

  const hasServerFollowingSeed = response.data.length > 0;

  useEffect(() => {
    if (!user?.user_id) return;
    void fetchProfile();
  }, [user?.user_id, fetchProfile]);

  const setFeedMode = useCallback((mode: FeedMode) => {
    userPickedTabRef.current = true;
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
    isSuccess,
    isError,
  } = useInfiniteQuery({
    queryKey: ["feed-posts", feedMode],
    queryFn: ({ pageParam }) => getFeedClient(pageParam, feedMode),
    getNextPageParam: (lastPage) => parseFeedCursor(lastPage?.next_page),
    enabled: !!user && authSessionResolved,
    initialPageParam: null as string | null,
    // Só usa SSR como seed se veio posts de verdade.
    // Seed vazio fazia isPending=false e a UI pintava “vazio” durante o refetch do dia seguinte.
    initialData:
      feedMode === "following" && hasServerFollowingSeed
        ? {
            pages: [
              {
                data: response.data,
                next_page: response.next_page ?? null,
              },
            ],
            pageParams: [null],
          }
        : undefined,
    refetchOnWindowFocus: false,
  });

  // Com seed SSR (posts já na tela), não troca por spinner no refetch.
  // Sem posts, isFetching precisa contar — senão empty state aparece cedo demais.
  const isFeedLoading =
    !authSessionResolved ||
    !user ||
    ((isPending || (isFetching && posts.length === 0)) && !isFetchingNextPage);

  useEffect(() => {
    if (!data?.pages) return;
    const merged = data.pages.flatMap((page) => page.data ?? []);
    setPosts(merged);
  }, [data]);

  useEffect(() => {
    if (userPickedTabRef.current || initialRedirectDoneRef.current) return;
    if (!authSessionResolved || !user) return;
    if (profile === undefined) return;
    if (feedMode !== "following") return;
    // Só redireciona após um fetch following bem-sucedido — não após seed SSR vazio/erro.
    if (!isSuccess || isFetching || isError) return;

    const followingPosts = data?.pages.flatMap((page) => page.data ?? []) ?? [];
    const hasFollowingPosts = followingPosts.length > 0;

    if (followingCount === 0 || !hasFollowingPosts) {
      setFeedModeState("explore");
      setPosts([]);
    }

    initialRedirectDoneRef.current = true;
  }, [
    authSessionResolved,
    user,
    profile,
    followingCount,
    feedMode,
    isSuccess,
    isFetching,
    isError,
    data,
  ]);

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
    [globalCreatePost],
  );

  const handleSave = useCallback((postId: string, saveId: number | null) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, user_already_saved: saveId !== null, user_save_id: saveId };
      }),
    );
  }, []);

  const handleRepost = useCallback((postId: string, repostId: number | null) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        if (repostId === null) {
          return {
            ...p,
            quantity_reposts: Math.max(0, p.quantity_reposts - 1),
            user_repost_id: null,
          };
        }
        return {
          ...p,
          quantity_reposts: p.quantity_reposts + 1,
          user_repost_id: repostId,
        };
      }),
    );
  }, []);

  const getPostById = (postId: string) => {
    return posts.find((p) => p.id === postId);
  };

  const injectPost = useCallback((post: PostProps) => {
    setPosts((prev) => {
      if (prev.find((p) => p.id === post.id)) return prev;
      return [post, ...prev];
    });
  }, []);

  const increaseCommentCount = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, quantity_comment: p.quantity_comment + 1 }
          : p,
      ),
    );
  };

  const decreaseCommentCount = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, quantity_comment: p.quantity_comment - 1 }
          : p,
      ),
    );
  };

  const handleLike = (postId: string) => {
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
          : p,
      ),
    );
  };

  const handlePostUpdate = useCallback(
    (updatedPost: PostProps | null, postId: string) => {
      if (updatedPost === null) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? ({ ...p, isRemoving: true } as PostProps & {
                  isRemoving: boolean;
                })
              : p,
          ),
        );
        setTimeout(() => {
          setPosts((prev) => prev.filter((p) => p.id !== postId));
        }, 300);
      } else {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? updatedPost : p)),
        );
      }
    },
    [],
  );

  const handleAuthorFollow = useCallback(
    (postId: string, following = true) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, user_already_follow: following } : p,
        ),
      );
    },
    [],
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
        handleSave,
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
        handleAuthorFollow,
      }}
    >
      {children}
    </FeedContext.Provider>
  );
};

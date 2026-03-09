"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { PostProps } from "@/app/feed/types/PostProps";
import { FeedContext } from "@/app/feed/context/FeedContext";
import type { FeedContextType } from "@/app/feed/context/FeedContextType";
import { getProfilePostsClient } from "@/services/getProfilePosts";

interface ProfilePostsContextValue extends FeedContextType {
  mediaPosts: PostProps[];
  textPosts: PostProps[];
  mediaNextPage: string | null;
  textNextPage: string | null;
  hasLoadedMedia: boolean;
  hasLoadedText: boolean;
  isLoadingMedia: boolean;
  isLoadingText: boolean;
  isLoadingMoreMedia: boolean;
  isLoadingMoreText: boolean;
  loadMediaPosts: (
    username: string,
    cursor?: string | null,
    append?: boolean
  ) => Promise<void>;
  loadTextPosts: (
    username: string,
    cursor?: string | null,
    append?: boolean
  ) => Promise<void>;
}

const ProfilePostsContext = createContext<ProfilePostsContextValue | undefined>(
  undefined
);

export function useProfilePostsContext() {
  const context = useContext(ProfilePostsContext);
  return context;
}

interface ProfilePostsProviderProps {
  children: React.ReactNode;
}

export function ProfilePostsProvider({ children }: ProfilePostsProviderProps) {
  const [mediaPosts, setMediaPosts] = useState<PostProps[]>([]);
  const [textPosts, setTextPosts] = useState<PostProps[]>([]);
  const [mediaNextPage, setMediaNextPage] = useState<string | null>(null);
  const [textNextPage, setTextNextPage] = useState<string | null>(null);
  const [hasLoadedMedia, setHasLoadedMedia] = useState(false);
  const [hasLoadedText, setHasLoadedText] = useState(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [isLoadingMoreMedia, setIsLoadingMoreMedia] = useState(false);
  const [isLoadingMoreText, setIsLoadingMoreText] = useState(false);

  const loadMediaPosts = useCallback(
    async (username: string, cursor: string | null = null, append = false) => {
      const loadingSetter = append ? setIsLoadingMoreMedia : setIsLoadingMedia;
      loadingSetter(true);
      try {
        const res = await getProfilePostsClient(username, true, cursor, 6);
        if (append) {
          setMediaPosts((prev) => [...prev, ...(res.data ?? [])]);
        } else {
          setMediaPosts(res.data ?? []);
        }
        if (res.next_page) {
          try {
            const url = new URL(res.next_page);
            setMediaNextPage(url.searchParams.get("cursor"));
          } catch {
            setMediaNextPage(null);
          }
        } else {
          setMediaNextPage(null);
        }
      } catch {
        setMediaPosts([]);
        setMediaNextPage(null);
      } finally {
        loadingSetter(false);
        setHasLoadedMedia(true);
      }
    },
    []
  );

  const loadTextPosts = useCallback(
    async (username: string, cursor: string | null = null, append = false) => {
      const loadingSetter = append ? setIsLoadingMoreText : setIsLoadingText;
      loadingSetter(true);
      try {
        const res = await getProfilePostsClient(username, false, cursor, 10);
        if (append) {
          setTextPosts((prev) => [...prev, ...(res.data ?? [])]);
        } else {
          setTextPosts(res.data ?? []);
        }
        if (res.next_page) {
          try {
            const url = new URL(res.next_page);
            setTextNextPage(url.searchParams.get("cursor"));
          } catch {
            setTextNextPage(null);
          }
        } else {
          setTextNextPage(null);
        }
      } catch {
        setTextPosts([]);
        setTextNextPage(null);
      } finally {
        loadingSetter(false);
        setHasLoadedText(true);
      }
    },
    []
  );

  const updatePostInLists = useCallback(
    (
      postId: number,
      updater: (post: PostProps) => PostProps
    ) => {
      setMediaPosts((prev) =>
        prev.map((p) => (p.id === postId ? updater(p) : p))
      );
      setTextPosts((prev) =>
        prev.map((p) => (p.id === postId ? updater(p) : p))
      );
    },
    []
  );

  const getPostById = useCallback(
    (postId: number) =>
      mediaPosts.find((p) => p.id === postId) ??
      textPosts.find((p) => p.id === postId),
    [mediaPosts, textPosts]
  );

  const handleLike = useCallback((postId: number) => {
    updatePostInLists(postId, (p) => ({
      ...p,
      user_already_like: !p.user_already_like,
      quantity_likes: p.user_already_like
        ? p.quantity_likes - 1
        : p.quantity_likes + 1,
    }));
  }, [updatePostInLists]);

  const increaseCommentCount = useCallback((postId: number) => {
    updatePostInLists(postId, (p) => ({
      ...p,
      quantity_comment: p.quantity_comment + 1,
    }));
  }, [updatePostInLists]);

  const decreaseCommentCount = useCallback((postId: number) => {
    updatePostInLists(postId, (p) => ({
      ...p,
      quantity_comment: Math.max(0, p.quantity_comment - 1),
    }));
  }, [updatePostInLists]);

  const posts = [...mediaPosts, ...textPosts];

  const feedContextValue: FeedContextType = {
    posts,
    createPostOpen: false,
    handlePostCreated: () => {},
    handleRepost: () => {},
    handlePostUpdate: () => {},
    handleCreatePostModal: () => {},
    getPostById,
    handleLike,
    fetchNextPage: async () => ({} as any),
    hasNextPage: false,
    isFetchingNextPage: false,
    increaseCommentCount,
    decreaseCommentCount,
  };

  const value: ProfilePostsContextValue = {
    ...feedContextValue,
    mediaPosts,
    textPosts,
    mediaNextPage,
    textNextPage,
    hasLoadedMedia,
    hasLoadedText,
    isLoadingMedia,
    isLoadingText,
    isLoadingMoreMedia,
    isLoadingMoreText,
    loadMediaPosts,
    loadTextPosts,
  };

  return (
    <ProfilePostsContext.Provider value={value}>
      <FeedContext.Provider value={feedContextValue}>
        {children}
      </FeedContext.Provider>
    </ProfilePostsContext.Provider>
  );
}

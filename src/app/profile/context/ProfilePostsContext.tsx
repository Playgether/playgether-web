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
import {
  getProfilePostsClient,
  type ProfilePostsFilters,
} from "@/services/getProfilePosts";

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
  mediaSearch: string;
  textSearch: string;
  mediaDateFrom: string;
  mediaDateTo: string;
  textDateFrom: string;
  textDateTo: string;
  hasActiveMediaFilters: boolean;
  hasActiveTextFilters: boolean;
  loadMediaPosts: (
    username: string,
    cursor?: string | null,
    append?: boolean,
    filters?: ProfilePostsFilters
  ) => Promise<void>;
  loadTextPosts: (
    username: string,
    cursor?: string | null,
    append?: boolean,
    filters?: ProfilePostsFilters
  ) => Promise<void>;
  setMediaSearch: (v: string) => void;
  setTextSearch: (v: string) => void;
  setMediaDateRange: (from: string, to: string) => void;
  setTextDateRange: (from: string, to: string) => void;
  clearMediaFilters: () => void;
  clearTextFilters: () => void;
  removePost: (postId: number) => void;
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

function parseCursorFromNextPage(nextPage: string | null): string | null {
  if (!nextPage) return null;
  try {
    const url = nextPage.startsWith("http")
      ? new URL(nextPage)
      : new URL(`http://dummy${nextPage.startsWith("?") ? "/" : ""}${nextPage}`);
    return url.searchParams.get("cursor");
  } catch {
    return null;
  }
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
  const [mediaSearch, setMediaSearch] = useState("");
  const [textSearch, setTextSearch] = useState("");
  const [mediaDateFrom, setMediaDateFrom] = useState("");
  const [mediaDateTo, setMediaDateTo] = useState("");
  const [textDateFrom, setTextDateFrom] = useState("");
  const [textDateTo, setTextDateTo] = useState("");
  const [mediaCache, setMediaCache] = useState<{
    posts: PostProps[];
    nextPage: string | null;
  }>({ posts: [], nextPage: null });
  const [textCache, setTextCache] = useState<{
    posts: PostProps[];
    nextPage: string | null;
  }>({ posts: [], nextPage: null });

  const hasActiveMediaFilters = !!(mediaSearch.trim() || mediaDateFrom || mediaDateTo);
  const hasActiveTextFilters = !!(textSearch.trim() || textDateFrom || textDateTo);

  const loadMediaPosts = useCallback(
    async (
      username: string,
      cursor: string | null = null,
      append = false,
      filters?: ProfilePostsFilters
    ) => {
      const loadingSetter = append ? setIsLoadingMoreMedia : setIsLoadingMedia;
      loadingSetter(true);
      const hasFilters = !!(
        filters?.search?.trim() ||
        filters?.timestampStart ||
        filters?.timestampEnd
      );
      try {
        const res = await getProfilePostsClient(
          username,
          true,
          cursor,
          6,
          filters
        );
        const data = res.data ?? [];
        if (append) {
          setMediaPosts((prev) => [...prev, ...data]);
        } else {
          setMediaPosts(data);
        }
        const next = parseCursorFromNextPage(res.next_page ?? null);
        setMediaNextPage(next);
        if (!hasFilters) {
          if (append) {
            setMediaCache((c) => ({
              posts: [...c.posts, ...data],
              nextPage: next,
            }));
          } else {
            setMediaCache({ posts: data, nextPage: next });
          }
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
    async (
      username: string,
      cursor: string | null = null,
      append = false,
      filters?: ProfilePostsFilters
    ) => {
      const loadingSetter = append ? setIsLoadingMoreText : setIsLoadingText;
      loadingSetter(true);
      const hasFilters = !!(
        filters?.search?.trim() ||
        filters?.timestampStart ||
        filters?.timestampEnd
      );
      try {
        const res = await getProfilePostsClient(
          username,
          false,
          cursor,
          10,
          filters
        );
        const data = res.data ?? [];
        if (append) {
          setTextPosts((prev) => [...prev, ...data]);
        } else {
          setTextPosts(data);
        }
        const next = parseCursorFromNextPage(res.next_page ?? null);
        setTextNextPage(next);
        if (!hasFilters) {
          if (append) {
            setTextCache((c) => ({
              posts: [...c.posts, ...data],
              nextPage: next,
            }));
          } else {
            setTextCache({ posts: data, nextPage: next });
          }
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

  const setMediaDateRange = useCallback((from: string, to: string) => {
    setMediaDateFrom(from);
    setMediaDateTo(to);
  }, []);

  const setTextDateRange = useCallback((from: string, to: string) => {
    setTextDateFrom(from);
    setTextDateTo(to);
  }, []);

  const clearMediaFilters = useCallback(() => {
    setMediaSearch("");
    setMediaDateFrom("");
    setMediaDateTo("");
    setMediaPosts(mediaCache.posts);
    setMediaNextPage(mediaCache.nextPage);
  }, [mediaCache]);

  const clearTextFilters = useCallback(() => {
    setTextSearch("");
    setTextDateFrom("");
    setTextDateTo("");
    setTextPosts(textCache.posts);
    setTextNextPage(textCache.nextPage);
  }, [textCache]);

  const removePost = useCallback((postId: number) => {
    setMediaPosts((prev) => prev.filter((p) => p.id !== postId));
    setTextPosts((prev) => prev.filter((p) => p.id !== postId));
    setMediaCache((c) => ({
      ...c,
      posts: c.posts.filter((p) => p.id !== postId),
    }));
    setTextCache((c) => ({
      ...c,
      posts: c.posts.filter((p) => p.id !== postId),
    }));
  }, []);

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
    mediaSearch,
    textSearch,
    mediaDateFrom,
    mediaDateTo,
    textDateFrom,
    textDateTo,
    hasActiveMediaFilters,
    hasActiveTextFilters,
    loadMediaPosts,
    loadTextPosts,
    setMediaSearch,
    setTextSearch,
    setMediaDateRange,
    setTextDateRange,
    clearMediaFilters,
    clearTextFilters,
    removePost,
  };

  return (
    <ProfilePostsContext.Provider value={value}>
      <FeedContext.Provider value={feedContextValue}>
        {children}
      </FeedContext.Provider>
    </ProfilePostsContext.Provider>
  );
}

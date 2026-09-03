import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";
import { PostProps } from "../types/PostProps";
import type { FeedMode } from "../types/FeedMode";

export interface FeedContextType {
  posts: PostProps[];
  feedMode: FeedMode;
  setFeedMode: (mode: FeedMode) => void;
  isFeedLoading: boolean;
  createPostOpen: boolean;
  handlePostCreated: (newPost: PostProps) => void;
  handleRepost: (postId: string, repostId: number | null) => void;
  handleSave: (postId: string, saveId: number | null) => void;
  handlePostUpdate: (updatedPost: PostProps | null, postId: string) => void;
  handleCreatePostModal: (argument: boolean) => void;
  getPostById: (postId: string) => PostProps | undefined;
  handleLike: (postId: string) => void;
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
  increaseCommentCount: (postId: string) => void;
  decreaseCommentCount: (postId: string) => void;
  injectPost: (post: PostProps) => void;
  handleAuthorFollow: (postId: string, following?: boolean) => void;
}

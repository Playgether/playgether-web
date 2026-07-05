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
  handleRepost: (postId: number, repostId: number | null) => void;
  handlePostUpdate: (updatedPost: PostProps | null, postId: number) => void;
  handleCreatePostModal: (argument: boolean) => void;
  getPostById: (postId: number) => PostProps | undefined;
  handleLike: (postId: number) => void;
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
  increaseCommentCount: (postId: number) => void;
  decreaseCommentCount: (postId: number) => void;
  injectPost: (post: PostProps) => void;
  handleAuthorFollow: (postId: number, following?: boolean) => void;
}

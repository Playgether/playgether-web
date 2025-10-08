import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from "@tanstack/react-query";
import { PostProps } from "../types/PostProps";

export interface FeedContextType {
  posts: PostProps[];
  createPostOpen: boolean;
  handlePostCreated: (newPost: PostProps) => void;
  handleRepost: (postId: number, repost: PostProps) => void;
  handlePostUpdate: (updatedPost: PostProps | null, postId: number) => void;
  handleCreatePostModal: (argument: boolean) => void;
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
}

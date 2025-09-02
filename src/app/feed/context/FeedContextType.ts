import { PostProps } from "../types/PostProps";

export interface FeedContextType {
  posts: PostProps[];
  createPostOpen: boolean;
  handlePostCreated: (newPost: PostProps) => void;
  handleRepost: (postId: number, repost: PostProps) => void;
  handlePostUpdate: (updatedPost: PostProps | null, postId: number) => void;
  handleCreatePostModal: (argument: boolean) => void;
  handleLike: (postId: number) => void;
}

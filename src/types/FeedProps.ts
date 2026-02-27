import { PostLikes } from "@/app/feed/types/PostLikesProps";
import { PostMedias } from "@/app/feed/types/PostMediaProps";
import { PostReposts } from "@/app/feed/types/PostRepostsProps";

export interface FeedProps {
  created_by_user: number;
  created_by_user_name: string;
  created_by_user_photo: string;
  likes: PostLikes[];
  reposts: PostReposts[];
  medias: PostMedias[];
  id: number;
  timestamp: Date;
  quantity_visualization: number;
  quantity_comment: number;
  quantity_likes: number;
  quantity_reposts: number;
  comment: string;
  has_post_media: boolean;
  link: string;
  user_already_like: boolean;
}

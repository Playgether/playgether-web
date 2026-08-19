import { PostLikes } from "./PostLikesProps";
import { PostMedias } from "./PostMediaProps";
import { PostReposts } from "./PostRepostsProps";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

export interface PostProps {
  created_by_user: number;
  name: string;
  profile_photo: string;
  likes: PostLikes[];
  reposts: PostReposts[];
  medias: PostMedias[];
  id: string;
  timestamp: Date;
  quantity_visualization: number;
  quantity_comment: number;
  quantity_likes: number;
  quantity_reposts: number;
  comment: string;
  has_post_media: boolean;
  link: string;
  user_already_like: boolean;
  user_already_follow?: boolean;
  verified: boolean;
  username: string;
  is_own?: boolean;
  isOwn?: boolean;
  comments_disabled?: boolean;
  highlighted_achievements?: HighlightedAchievementPublic[];
  user_repost_id?: number | null;
  user_already_saved?: boolean;
  user_save_id?: number | null;
  isRepost?: boolean;
  repost_id?: number;
  repost_comment?: string | null;
  repost_by_name?: string;
  repost_by_username?: string;
  repost_by_photo?: string;
}

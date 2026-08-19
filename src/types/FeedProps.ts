import { PostLikes } from "@/app/feed/types/PostLikesProps";
import { PostMedias } from "@/app/feed/types/PostMediaProps";
import { PostReposts } from "@/app/feed/types/PostRepostsProps";
import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

export interface FeedProps {
  created_by_user: number;
  /** Nome completo (API: `name` ou legado). */
  name?: string;
  /** @username para links de perfil (API). */
  username?: string;
  created_by_user_name: string;
  created_by_user_photo: string;
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
  highlighted_achievements?: HighlightedAchievementPublic[];
}

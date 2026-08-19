import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

export interface OnlineUsersChatRoom {
  id: string | number;
  fullname: string;
  profile_photo: string;
  username: string;
  highlighted_achievements?: HighlightedAchievementPublic[];
}

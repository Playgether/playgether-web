export interface Cut {
  id: string;
  caption: string;
  video_file: string;
  thumbnail: string;
  duration: number | null;
  width: number | null;
  height: number | null;
  file_format: string;
  bytes_file: number | null;
  views_count: number;
  likes_count: number;
  comments_count: number;
  comments_disabled: boolean;
  timestamp: string;
  created_by_user: number;
  username: string;
  name: string;
  profile_photo: string | null;
  verified: boolean;
  user_already_like: boolean;
  user_already_follow: boolean;
  user_already_saved: boolean;
  user_save_id: number | null;
  is_own: boolean;
}

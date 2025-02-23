export interface PostReposts {
  id: number;
  created_by_user_name: string;
  created_by_user_photo: string;
  timestamp: Date;
  object_id: number;
  content_type: string;
  user: number;
  comment: string;
  quantity_visualization: number;
  quantity_comment: number;
  quantity_likes: number;
  quantity_shares: number;
}

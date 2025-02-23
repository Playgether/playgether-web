export interface ProfileProps {
  id: number;
  bio: string;
  profile_photo: string;
  hours_played: number;
  matches_played: number;
  performance: string;
  gamer_nivel: number;
  verified: boolean;
  quantity_comment: number;
  quantity_likes: number;
  follows: [];
  followed_by: [];
  name: string;
}

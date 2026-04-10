export interface ProfileProps {
  id: number;
  bio: string;
  profile_photo: string | null;
  hours_played: number;
  matches_played: number;
  performance: string;
  gamer_nivel: number;
  verified: boolean;
  quantity_comment: number;
  quantity_likes: number;
  follows: unknown[];
  followed_by: unknown[];
  name: string;
  /** API pode enviar string (ex.: serializer com f-string). */
  quantity_posts?: string | number;
}

import { ChatRules } from "./ChatRules";

export interface ChatRoom {
  id: number;
  /** Segmento da URL `/rooms/[slug]` (sem espaços). */
  slug: string;
  group_name: string;
  banner: string | null;
  summary: string;
  description: string;
  created_at: Date;
  created_at_formated: string;
  total_messages: number;
  capacity: number;
  peak_users: number;
  owner: number;
  owner_fullname: string;
  owner_username: string;
  rules: ChatRules[];
  is_favorited: boolean;
  /** public_id Cloudinary por período (manhã, tarde, etc.) */
  ambient_images?: Record<string, string>;
}

export interface ChatRoomPagination {
  next: string;
  previous: string;
  results: ChatRoom[];
}

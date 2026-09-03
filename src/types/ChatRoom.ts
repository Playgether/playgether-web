import { ChatRules } from "./ChatRules";
import type { AmbientPeriodKey } from "@/app/utils/roomAmbientPeriod";

export type RoomAmbientMode = "schedule" | "fixed";

export type RoomAmbientSettings = Partial<
  Record<AmbientPeriodKey, string>
> & {
  mode?: RoomAmbientMode;
  fixed?: string;
};

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
  owner: string | number;
  owner_fullname: string;
  owner_username: string;
  rules: ChatRules[];
  is_favorited: boolean;
  /** Ambientação fixa ou public_id Cloudinary por período. */
  ambient_images?: RoomAmbientSettings;
}

export interface ChatRoomPagination {
  next: string;
  previous: string;
  results: ChatRoom[];
}

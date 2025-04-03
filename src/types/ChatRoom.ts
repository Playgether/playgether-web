import { ChatRules } from "./ChatRules";

export interface ChatRoom {
  id: number;
  group_name: string;
  banner: string;
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
}

export interface ChatRoomPagination {
  next: string;
  previous: string;
  results: ChatRoom[];
}

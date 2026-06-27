export type RoomRankingPeriod = "daily" | "weekly" | "monthly" | "all";
export type RoomRankingBoard = "points" | "wins" | "streak" | "participation";

export interface RoomRankingRow {
  rank: number;
  user_id: number;
  username: string;
  fullname: string;
  profile_photo: string;
  value: number;
}

export interface RoomRankingsResponse {
  period: RoomRankingPeriod;
  board: RoomRankingBoard;
  event_type?: string | null;
  rows: RoomRankingRow[];
  my_rank: { rank: number | null; value: number } | null;
  streak_label: string;
  season_bonuses: {
    daily_top: number;
    weekly_top: number;
    monthly_top: number;
    general: string;
  };
}

export interface RoomMemberStatRow {
  user_id: number;
  username: string;
  fullname: string;
  profile_photo: string;
  message_count: number;
  hours_in_room: number;
  days_visited: number;
  events_participated: number;
  transmissions_participated: number;
  current_streak: number;
  participation_score?: number;
  distinct_message_hours?: number;
  best_streak?: number;
}

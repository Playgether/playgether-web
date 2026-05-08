export type RoomEventType = "vote_best" | "quiz_elimination" | "button_quiz";

export type RoomGamePhase =
  | "recruitment"
  | "host_setup"
  | "vote_creation"
  | "vote_reveal"
  | "vote_voting"
  | "quiz_main"
  | "quiz_finals"
  | "button_play"
  | "button_answering"
  | "button_gabarito"
  | "finished";

export interface RoomEventSubmission {
  id: number;
  event: number;
  round_number: number;
  author: number;
  content: string;
  created_at?: string;
}

export interface RoomEvent {
  id: number;
  room: number;
  created_by: number;
  event_type: RoomEventType;
  title: string;
  status: string;
  game_phase?: RoomGamePhase | string;
  recruitment_deadline_at?: string | null;
  current_voting_round?: number;
  tie_break_author_ids?: number[];
  outcome_draw?: boolean;
  rounds_total: number;
  join_window_sec: number;
  answer_time_sec: number;
  vote_time_sec: number;
  current_round: number;
  current_question_order: number;
  current_question_id?: number | null;
  current_question_text?: string | null;
  current_question_started_at?: string | null;
  current_question_deadline_at?: string | null;
  button_claimed_by?: number | null;
  button_unlock_at?: string | null;
  button_answer_deadline_at?: string | null;
  button_claimer_has_answered?: boolean;
  /** Na fase gabarito do Button Quiz: a resposta enviada bate com o gabarito cadastrado. */
  button_gabarito_answer_correct?: boolean;
  participants?: RoomEventParticipant[];
  questions?: RoomEventQuestion[];
  submissions?: RoomEventSubmission[];
  final_scores?: RoomEventFinalScore[];
}

export interface RoomEventFinalScore {
  id: number;
  event: number;
  user: number;
  username?: string;
  total: number;
  placement: number | null;
  created_at?: string;
  /** Detalhes da composição do total (API room_events). */
  points_participation?: number;
  points_question_correct?: number;
  points_question_wrong?: number;
  points_votes?: number;
}

export interface RoomEventQuestion {
  id: number;
  round_number: number;
  order: number;
  text: string;
  answer_key?: string;
  is_final?: boolean;
  time_limit_sec?: number;
}

export interface RoomEventParticipant {
  id: number;
  event: number;
  user: number;
  username?: string;
  is_active_player: boolean;
  is_eliminated: boolean;
  left_early: boolean;
  participation_confirmed: boolean;
  invitation_declined?: boolean;
}

export interface RoomEventMessage {
  id: number;
  body: string;
  username?: string;
  author?: number | null;
  is_system?: boolean;
  created_at?: string;
}

export interface RoomEventInvitePayload {
  event_id: number;
  title: string;
  event_type: string;
  organizer_user_id: number;
  organizer_username: string;
  recruitment_deadline_at: string | null;
  room_slug: string;
}

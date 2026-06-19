import type { HighlightedAchievementPublic } from "@/types/highlightedAchievements";

// ─── Game (from backend /api/v1/games/) ─────────────────────────────────────

export interface Game {
  id: number;
  name: string;
  acronym: string;
  description: string;
  icon: string;
  image: string;
}

// ─── Game Stats ──────────────────────────────────────────────────────────────

export interface LolStats {
  username: string;
  tag: string;
  rank: string | null;
  icon: string | null;
  /** URL do brasão do elo (Community Dragon), quando há ranked. */
  tier_emblem_url?: string | null;
  level: number;
  league_points: number;
  wins: number;
  losses: number;
  winrate: number;
}

export interface CsStats {
  nickname: string;
  avatar: string | null;
  kd: number | null;
  hs_percent: number | null;
  hours_played: number | null;
}

export type GameStats = LolStats | CsStats;

export interface StatsResponse {
  connected: boolean;
  stats: GameStats | null;
}

// ─── Schema (preferences form definition from backend) ───────────────────────

export interface LolSchema {
  roles: string[];
  elo_tiers: string[];
  play_times: string[];
}

export interface CsSchema {
  roles: string[];
  premier_ranges: string[];
  play_times: string[];
}

export type GameSchema = LolSchema | CsSchema;

// ─── Preferences (user-filled form data) ─────────────────────────────────────

export interface LolPreferences {
  main_role: string;
  secondary_role: string;
  own_elo: string;
  desired_roles: string[];
  accepted_elo: string[];
  play_times: string[];
  /** Mensagem curta visível para quem te encontrar no duo (máx. ~240 caracteres no backend). */
  duo_note?: string;
}

export interface CsPreferences {
  own_range: string;
  favorite_weapons: string[];
  roles: string[];
  desired_roles: string[];
  accepted_ranges: string[];
  play_times: string[];
  duo_note?: string;
}

export type GamePreferences = LolPreferences | CsPreferences;

// ─── Queue ───────────────────────────────────────────────────────────────────

export interface DuoQueue {
  id: number;
  game_name: string;
  game_slug: string;
  status: "active" | "expired" | "cancelled";
  preferences: GamePreferences;
  entered_at: string;
  expires_at: string;
  last_active_at: string;
  time_remaining_seconds: number;
  is_near_expiry: boolean;
}

// ─── Match ───────────────────────────────────────────────────────────────────

export interface MatchPartner {
  user_id: string | number;
  username: string;
  first_name: string;
  last_name: string;
  profile_photo: string | null;
  preferences: Partial<GamePreferences>;
  /** Estatísticas do jogo (CS2, LoL, …) vindas do backend. */
  game_stats?: Record<string, unknown> | null;
  /** Conquistas fixadas no perfil (até 3), para exibir no card do duo. */
  highlighted_achievements?: HighlightedAchievementPublic[];
}

export interface DuoMatchScoreBreakdown {
  elo: number;
  role: number;
  schedule: number;
  extras: number;
  total: number;
}

export interface DuoMatch {
  id: number;
  game_name: string;
  game_slug: string;
  score: number;
  score_breakdown?: DuoMatchScoreBreakdown | null;
  created_at: string;
  partner: MatchPartner;
}

// ─── WebSocket messages ───────────────────────────────────────────────────────

export type WsQueueStatus =
  | "in_queue"
  | "not_in_queue"
  | "searching"
  | "left"
  | "renewed"
  | "evicted"
  | "preferences_updated";

export interface WsQueueStatusMsg {
  type: "duo_queue_status";
  status: WsQueueStatus;
  game_slug: string;
  expires_at?: string;
  is_near_expiry?: boolean;
  preferences?: GamePreferences;
  reason?: string;
}

export interface WsMatchMsg {
  type: "duo_match";
  match: DuoMatch;
}

export interface WsExistingMatchesMsg {
  type: "duo_existing_matches";
  matches: DuoMatch[];
}

export interface WsErrorMsg {
  type: "error";
  message: string;
}

export type WsMessage =
  | WsQueueStatusMsg
  | WsMatchMsg
  | WsExistingMatchesMsg
  | WsErrorMsg;

// ─── Flow state shared across steps ──────────────────────────────────────────

export interface DuoFlowState {
  selectedGame: Game | null;
  stats: GameStats | null;
  schema: GameSchema | null;
  preferences: Partial<GamePreferences>;
  queue: DuoQueue | null;
}

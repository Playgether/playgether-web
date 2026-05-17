import type { ProviderName } from "@/types/RoomMusic";

// Event type literals — must match backend constants in chat/telemetry.py

export type PlaybackEventType =
  | "IFRAME_LOAD_SUCCESS"
  | "IFRAME_LOAD_FAILED"
  | "AUTOPLAY_BLOCKED"
  | "PLAYBACK_STARTED"
  | "PLAYBACK_STALLED"
  | "PLAYBACK_ABANDONED"
  | "PROVIDER_SWITCHED_RUNTIME"
  | "PLAYER_READY"
  | "TIME_TO_FIRST_PLAY";

export interface PlaybackTelemetryPayload {
  event_type: PlaybackEventType;
  room_slug: string;
  provider: ProviderName;
  canonical_track_id?: string;
  /** Time-to-first-play or stall duration, in ms */
  time_ms?: number;
  /** Error message from iframe/player, truncated to 200 chars */
  error?: string;
  /** Provider being switched away from (PROVIDER_SWITCHED_RUNTIME only) */
  fallback_from?: ProviderName;
  /** Seconds of audio played before abandon/stall */
  duration_played_sec?: number;
  /** Sync drift in seconds (positive = ahead, negative = behind) */
  sync_drift_sec?: number;
}

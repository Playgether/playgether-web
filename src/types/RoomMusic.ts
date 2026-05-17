// ---------------------------------------------------------------------------
// Provider types
// ---------------------------------------------------------------------------

export type ProviderName = "youtube" | "spotify" | "deezer";

export type YouTubeProviderData = {
  video_id: string;
  embeddable: boolean;
};

export type SpotifyProviderData = {
  track_id: string;
  embed_url: string;
  duration_sec?: number | null;
};

export type DeezerProviderData = {
  track_id: string;
  embed_url: string;
  duration_sec?: number | null;
};

export type MediaProviders = {
  youtube?: YouTubeProviderData;
  spotify?: SpotifyProviderData;
  deezer?: DeezerProviderData;
};

// ---------------------------------------------------------------------------
// MediaTrack – unified queue item
//
// `video_id` is kept at the top level for full backward-compatibility with
// existing WebSocket parsing and filter code (11-char regex test).
// ---------------------------------------------------------------------------

export type MediaTrack = {
  video_id: string;
  title: string;
  artist?: string;
  thumbnail?: string;
  duration_sec?: number | null;
  providers?: MediaProviders;
  active_provider?: ProviderName;
  added_by?: string;
};

/** Legacy alias – existing code that imports RoomMusicQueueItem still works. */
export type RoomMusicQueueItem = MediaTrack;

// ---------------------------------------------------------------------------
// Room music state (unchanged structure, queue item type upgraded)
// ---------------------------------------------------------------------------

export type RoomMusicState = {
  queue: MediaTrack[];
  current_index: number;
  playing: boolean;
  volume: number;
  position_sec: number;
  sync_epoch_ms: number;
};

// ---------------------------------------------------------------------------
// Client actions
//
// The "add" action now carries the full track resolved by MediaResolverService.
// Legacy payloads (bare video_id + title) are still accepted by the backend.
// ---------------------------------------------------------------------------

export type RoomMusicClientAction =
  | { action: "add"; track: MediaTrack }
  | { action: "remove"; index: number }
  | { action: "select"; index: number }
  | { action: "play"; position_sec?: number }
  | { action: "pause"; position_sec: number }
  | { action: "seek"; position_sec: number }
  | { action: "volume"; volume: number }
  | { action: "next" }
  | { action: "prev" };

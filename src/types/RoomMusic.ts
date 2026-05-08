export type RoomMusicQueueItem = {
  video_id: string;
  title: string;
  added_by?: string;
};

export type RoomMusicState = {
  queue: RoomMusicQueueItem[];
  current_index: number;
  playing: boolean;
  volume: number;
  position_sec: number;
  sync_epoch_ms: number;
};

export type RoomMusicClientAction =
  | { action: "add"; video_id: string; title: string }
  | { action: "remove"; index: number }
  | { action: "select"; index: number }
  | { action: "play"; position_sec?: number }
  | { action: "pause"; position_sec: number }
  | { action: "seek"; position_sec: number }
  | { action: "volume"; volume: number }
  | { action: "next" }
  | { action: "prev" };

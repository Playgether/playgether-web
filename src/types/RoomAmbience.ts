export type RoomAmbienceState = {
  active: boolean;
  host_user_id: string | null;
  host_username: string;
  host_profile_photo: string;
  video_id: string;
  title: string;
  channel_name: string;
  channel_url: string;
  channel_thumbnail: string;
  channel_avatar_url: string;
  playing: boolean;
  position_sec: number;
  sync_epoch_ms: number;
  /** Comando único para espectadores (ex.: botão “Ao vivo” do YouTube em live). */
  playback_command?: "go_live" | null;
  viewers: RoomAmbienceViewer[];
  pinned_message_id: number | null;
  /** Identificador da transmissão ao vivo atual; mensagens de outras sessões não são exibidas. */
  session_id: string;
};

export type RoomAmbienceViewer = {
  user_id: string;
  username: string;
  fullname: string;
  profile_photo?: string;
};

export type RoomAmbienceMessage = {
  id: number;
  author_user_id: string | null;
  author_username: string;
  author_photo?: string;
  body: string;
  created_at_ms: number;
  /** Mensagens do servidor (ex.: troca de vídeo), sem avatar de utilizador. */
  is_system?: boolean;
  reply_to_id?: number;
  reply_to_username?: string;
  reply_to_body?: string;
  transmission_session_id?: string;
};

export type RoomAmbienceClientAction =
  | {
      action: "create";
      video_id: string;
      title: string;
      channel_name?: string;
      channel_url?: string;
      channel_thumbnail?: string;
      channel_avatar_url?: string;
    }
  | { action: "close" }
  | { action: "play"; position_sec?: number }
  | { action: "pause"; position_sec?: number }
  | { action: "seek"; position_sec: number }
  | { action: "go_live"; position_sec?: number }
  | {
      action: "change_video";
      video_id: string;
      title: string;
      channel_name?: string;
      channel_url?: string;
      channel_thumbnail?: string;
      channel_avatar_url?: string;
    }
  | { action: "send_message"; body: string; reply_to_id?: number }
  | { action: "pin_message"; message_id: number | null }
  | { action: "viewer_join" }
  | { action: "viewer_leave" }
  /** Qualquer cliente pede; o host reage publicando seek com o tempo atual do iframe. */
  | { action: "request_playback_anchor" };

/**
 * Nomes dos upload presets no Cloudinary (devem bater 1:1 com o dashboard).
 */
export enum PresetsCloudinary {
  profile_image = "profile-photos",
  profile_banners = "profile-banners",
  profile_milestones = "profile-milestones",
  /** Vídeo de milestone (incoming com eo_60 etc.). */
  profile_milestones_videos = "profile-milestones-videos",
  /** Ambientação das salas — imagem (e vídeo se o preset misturar formatos). */
  rooms_ambiance = "rooms-ambiance",
  /** Ambientação em vídeo, se separado no dashboard. */
  rooms_ambiance_videos = "rooms-ambiance-videos",
  chat_room_banner = "chat-room-banner",
  /** Mídia de post — imagem e vídeo no mesmo preset (permite lote misto). */
  posts = "posts",
}

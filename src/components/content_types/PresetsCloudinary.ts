/**
 * Nomes dos upload presets no Cloudinary (devem bater 1:1 com o dashboard).
 */
export enum PresetsCloudinary {
  profile_image = "profile-photos",
  profile_banners = "profile-banners",
  /** Mídias de milestones — preset único para imagens e vídeos. */
  profile_milestones = "profile-milestones",
  /** Ambientação das salas — preset único para imagens e vídeos. */
  rooms_ambiance = "rooms-ambiance",
  chat_room_banner = "chat-room-banner",
  /** Mídia de post — imagem e vídeo no mesmo preset (permite lote misto). */
  posts = "posts",
  /** Vídeos de cuts — pasta raiz `cuts`, só vídeo. */
  cuts = "cuts",
  /** Anexos de feedback e do formulário "Ajuda e contato". */
  feedback_attachments = "feedback-attachments",
}

import { StaticImageData } from "next/legacy/image";

export interface ConversationInterface {
  id: string;
  name: string;
  avatar: StaticImageData | string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  type: "private" | "clan" | "group";
  /** Username do outro participante (DMs privadas) — usado para perfil / block / mute. */
  username?: string;
  isMuted?: boolean;
  hasLeft?: boolean;
  /** False when messaging is restricted (privacy settings / block). */
  canMessage?: boolean;
}

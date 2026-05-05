import { ChatRoom } from "@/types/ChatRoom";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";

/** Corpo típico do endpoint `chatrooms/detailed/` (paginação por cursor). */
export type ChatRoomDetailedBody = {
  next?: string | null;
  previous?: string | null;
  results?: {
    group?: ChatRoom;
    messages?: ChatRoomMessages[];
  };
};

export function extractRoomFromDetailedBody(
  body: ChatRoomDetailedBody | null | undefined
): {
  room: ChatRoom | undefined;
  messages: ChatRoomMessages[];
  /** URL `next` da paginação DRF — mensagens mais antigas ao scrollar para cima. */
  messagesNextPageUrl: string | null;
} {
  if (!body) {
    return { room: undefined, messages: [], messagesNextPageUrl: null };
  }
  const nested = body.results;
  const next =
    typeof body.next === "string" && body.next.trim()
      ? body.next.trim()
      : null;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return {
      room: nested.group,
      messages: Array.isArray(nested.messages) ? nested.messages : [],
      messagesNextPageUrl: next,
    };
  }
  return { room: undefined, messages: [], messagesNextPageUrl: next };
}

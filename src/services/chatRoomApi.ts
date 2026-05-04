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
} {
  if (!body) {
    return { room: undefined, messages: [] };
  }
  const nested = body.results;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return {
      room: nested.group,
      messages: Array.isArray(nested.messages) ? nested.messages : [],
    };
  }
  return { room: undefined, messages: [] };
}

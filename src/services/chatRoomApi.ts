import { ChatRoom } from "@/types/ChatRoom";
import { ChatRoomMessages } from "@/types/ChatRoomMessages";
import type { RoomPermissionsSnapshot } from "@/types/RoomPermissions";

/** Corpo típico do endpoint `chatrooms/detailed/` (paginação por cursor). */
export type ChatRoomDetailedBody = {
  next?: string | null;
  previous?: string | null;
  results?: {
    group?: ChatRoom;
    messages?: ChatRoomMessages[];
    room_permissions?: RoomPermissionsSnapshot;
  };
  room_permissions?: RoomPermissionsSnapshot;
};

export function extractRoomFromDetailedBody(
  body: ChatRoomDetailedBody | null | undefined
): {
  room: ChatRoom | undefined;
  messages: ChatRoomMessages[];
  /** URL `next` da paginação DRF — mensagens mais antigas ao scrollar para cima. */
  messagesNextPageUrl: string | null;
  roomPermissions: RoomPermissionsSnapshot | null;
} {
  if (!body) {
    return {
      room: undefined,
      messages: [],
      messagesNextPageUrl: null,
      roomPermissions: null,
    };
  }
  const nested = body.results;
  const next =
    typeof body.next === "string" && body.next.trim()
      ? body.next.trim()
      : null;
  const roomPermissions =
    nested?.room_permissions ?? body.room_permissions ?? null;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return {
      room: nested.group,
      messages: Array.isArray(nested.messages) ? nested.messages : [],
      messagesNextPageUrl: next,
      roomPermissions,
    };
  }
  return {
    room: undefined,
    messages: [],
    messagesNextPageUrl: next,
    roomPermissions,
  };
}

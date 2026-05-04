import { cookies } from "next/headers";
import { api } from "./api";
import type { ChatRoomDetailedBody } from "./chatRoomApi";

/** `roomSlug` é o slug na URL (`/rooms/[roomSlug]`); IDs numéricos ainda funcionam como legado. */
export const getChatRoomDetailed = async (
  roomSlug: string
): Promise<ChatRoomDetailedBody | null> => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return null;
  }
  const s = String(roomSlug).trim();
  if (!s) {
    return null;
  }
  const query = /^\d+$/.test(s)
    ? `id=${encodeURIComponent(s)}`
    : `slug=${encodeURIComponent(s)}`;
  try {
    const response = await api.get<ChatRoomDetailedBody>(
      `/api/v1/chatrooms/detailed/?${query}`,
      {
        headers: {
          Authorization: "Bearer " + String(accessToken),
        },
      }
    );
    return response.data ?? null;
  } catch {
    return null;
  }
};

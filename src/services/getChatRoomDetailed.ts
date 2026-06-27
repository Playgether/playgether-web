import { cookies } from "next/headers";
import { api } from "./api";
import type { ChatRoomDetailedBody } from "./chatRoomApi";

export type ChatRoomDetailedResult =
  | { status: "ok"; data: ChatRoomDetailedBody }
  | { status: "banned"; message: string }
  | { status: "error" };

/** `roomSlug` é o slug na URL (`/rooms/[roomSlug]`); IDs numéricos ainda funcionam como legado. */
export const getChatRoomDetailed = async (
  roomSlug: string,
): Promise<ChatRoomDetailedResult> => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return { status: "error" };
  }
  const s = String(roomSlug).trim();
  if (!s) {
    return { status: "error" };
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
      },
    );
    return { status: "ok", data: response.data };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: { detail?: string } } };
    if (err.response?.status === 403) {
      const detail = err.response.data?.detail;
      return {
        status: "banned",
        message:
          typeof detail === "string" && detail.trim()
            ? detail.trim()
            : "Não foi possível entrar: você foi expulso desta sala.",
      };
    }
    return { status: "error" };
  }
};

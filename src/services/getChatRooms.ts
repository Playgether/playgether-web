import { cookies } from "next/headers";
import { ChatRoomPagination } from "@/types/ChatRoom";
import { api } from "./api";

export const getChatRooms = async (): Promise<ChatRoomPagination | null> => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return null;
  }
  try {
    const response = await api.get<ChatRoomPagination>(`/api/v1/chatrooms/`, {
      headers: {
        Authorization: "Bearer " + String(accessToken),
      },
    });
    return response.data ?? null;
  } catch {
    return null;
  }
};

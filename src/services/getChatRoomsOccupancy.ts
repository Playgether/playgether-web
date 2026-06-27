import { cookies } from "next/headers";
import { api } from "./api";

export async function getChatRoomsOccupancy(
  roomIds: number[],
): Promise<Record<string, number>> {
  if (roomIds.length === 0) return {};

  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return {};

  try {
    const response = await api.get<Record<string, number>>(
      "/api/v1/chatrooms/occupancy/",
      {
        params: { ids: roomIds.join(",") },
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data ?? {};
  } catch {
    return {};
  }
}

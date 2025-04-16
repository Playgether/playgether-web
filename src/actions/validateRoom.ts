'use server';

import { validateRoomService } from "@/services/validateRoom";

export async function validateRoomAction(roomName: string) {
  const res = await validateRoomService(roomName);

  if (!res.ok || !res.response?.data.ok) {
    const errorMsg =
      typeof res.error === "object" && res.error.data?.error
        ? res.error.data.error
        : res.response?.data?.error || "Sala inválida";

    return { success: false, message: errorMsg };
  }

  return { success: true };
}

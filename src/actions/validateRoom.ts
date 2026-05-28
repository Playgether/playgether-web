'use server';

import { validateRoomService } from "@/services/validateRoom";

export async function validateRoomAction(roomSlug: string) {
  const res = await validateRoomService(roomSlug);

  if (!res.ok || !res.response?.data.ok) {
    const errorMsg =
      typeof res.error === "object" && res.error.data?.error
        ? res.error.data.error
        : res.response?.data?.error || "Sala inválida";

    const code =
      typeof res.error === "object" && res.error.data?.code
        ? String(res.error.data.code)
        : undefined;

    return {
      success: false,
      message: errorMsg,
      roomBanned: code === "room_banned",
    };
  }

  return { success: true };
}

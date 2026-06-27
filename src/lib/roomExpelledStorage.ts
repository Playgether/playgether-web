const STORAGE_KEY = "playgether:room-expelled";

export type RoomExpelledPayload = {
  slug: string;
  message: string;
};

export function storeRoomExpelledMessage(slug: string, reason: string) {
  try {
    const payload: RoomExpelledPayload = {
      slug: slug.trim(),
      message: reason.trim(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode */
  }
}

export function consumeRoomExpelledMessage(): RoomExpelledPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw) as RoomExpelledPayload;
    if (!parsed?.slug || !parsed?.message) return null;
    return parsed;
  } catch {
    return null;
  }
}

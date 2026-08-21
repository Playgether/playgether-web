import type { GamePreferences } from "../types/duo";

const VERSION = "v1";

function storageKey(gameSlug: string): string {
  return `duo:draft:${VERSION}:${gameSlug.toLowerCase()}`;
}

export type DuoDraft = {
  preferences: Partial<GamePreferences>;
  updatedAt: number;
};

export function loadDuoDraft(gameSlug: string): DuoDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(gameSlug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DuoDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      preferences:
        parsed.preferences && typeof parsed.preferences === "object"
          ? parsed.preferences
          : {},
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0,
    };
  } catch {
    return null;
  }
}

export function saveDuoDraft(
  gameSlug: string,
  preferences: Partial<GamePreferences>
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: DuoDraft = {
      preferences: preferences ?? {},
      updatedAt: Date.now(),
    };
    sessionStorage.setItem(storageKey(gameSlug), JSON.stringify(payload));
  } catch {
    // private mode / quota
  }
}

export function clearDuoDraft(gameSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(storageKey(gameSlug));
  } catch {
    // ignore
  }
}

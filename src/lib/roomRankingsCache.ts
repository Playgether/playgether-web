import type { RoomRankingPeriod } from "@/actions/roomRankingsActions";
import type { RoomMemberStatRow, RoomRankingRow } from "@/types/RoomRankings";

const CACHE_VERSION = 1;
const STORAGE_PREFIX = "room_rankings:v1:";

export type RoomRankingsPanelCache = {
  version: number;
  fetchedAt: number;
  period: RoomRankingPeriod;
  pointsRows: RoomRankingRow[];
  winsRows: RoomRankingRow[];
  streakRows: RoomRankingRow[];
  participationRows: RoomRankingRow[];
  gameWinRows: Record<string, RoomRankingRow[]>;
  myRanks: Partial<
    Record<"points" | "wins" | "streak" | "participation", { rank: number | null; value: number }>
  >;
  memberStats: RoomMemberStatRow[];
  canViewEngagement: boolean;
};

function storageKey(roomSlug: string, period: RoomRankingPeriod) {
  return `${STORAGE_PREFIX}${roomSlug}:${period}`;
}

export function readRoomRankingsCache(
  roomSlug: string,
  period: RoomRankingPeriod,
): RoomRankingsPanelCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(roomSlug, period));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RoomRankingsPanelCache;
    if (parsed.version !== CACHE_VERSION || parsed.period !== period) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeRoomRankingsCache(
  roomSlug: string,
  period: RoomRankingPeriod,
  data: Omit<RoomRankingsPanelCache, "version" | "fetchedAt" | "period">,
) {
  if (typeof window === "undefined") return;
  try {
    const entry: RoomRankingsPanelCache = {
      version: CACHE_VERSION,
      fetchedAt: Date.now(),
      period,
      ...data,
    };
    sessionStorage.setItem(storageKey(roomSlug, period), JSON.stringify(entry));
  } catch {
    /* quota / modo privado */
  }
}

export const RANKINGS_REFRESH_COOLDOWN_MS = 30_000;

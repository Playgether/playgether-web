"use server";

import { api } from "@/services/api";
import type { RoomMemberStatRow, RoomRankingsResponse } from "@/types/RoomRankings";
import { isAxiosError } from "axios";
import { cookies } from "next/headers";

export type RoomRankingPeriod = "daily" | "weekly" | "monthly" | "all";
export type RoomRankingBoard = "points" | "wins" | "streak" | "participation";

const GAME_WIN_EVENT_TYPES = ["vote_best", "button_quiz"] as const;

async function authHeaders() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return null;
  return { Authorization: `Bearer ${accessToken}` };
}

function throttleError(err: unknown) {
  if (!isAxiosError(err) || err.response?.status !== 429) return null;
  const data = err.response.data as { detail?: string; retry_after_sec?: number };
  return {
    error: data?.detail ?? "Aguarde antes de atualizar novamente.",
    retryAfterSec: data?.retry_after_sec ?? 30,
  };
}

export async function fetchRoomRankings(
  roomSlug: string,
  period: RoomRankingPeriod = "weekly",
  board: RoomRankingBoard = "points",
  eventType?: string,
  refresh = false,
) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const qs = new URLSearchParams({ period, board });
    if (eventType) qs.set("event_type", eventType);
    if (refresh) qs.set("refresh", "1");
    const res = await api.get<RoomRankingsResponse>(
      `/api/v1/chatrooms/${encodeURIComponent(roomSlug)}/rankings/?${qs}`,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch (err) {
    const throttled = throttleError(err);
    if (throttled) {
      return {
        ok: false as const,
        error: throttled.error,
        throttled: true as const,
        retryAfterSec: throttled.retryAfterSec,
      };
    }
    return { ok: false as const, error: "Falha ao carregar rankings." };
  }
}

export async function fetchRoomMemberStats(roomSlug: string, refresh = false) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const url = `/api/v1/chatrooms/${encodeURIComponent(roomSlug)}/member-stats/`;
    const res = await api.get<{ rows: RoomMemberStatRow[]; can_view_engagement: boolean }>(
      refresh ? `${url}?refresh=1` : url,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch (err) {
    const throttled = throttleError(err);
    if (throttled) {
      return {
        ok: false as const,
        error: throttled.error,
        throttled: true as const,
        retryAfterSec: throttled.retryAfterSec,
      };
    }
    return { ok: false as const, error: "Falha ao carregar estatísticas." };
  }
}

export type RoomRankingsPanelData = {
  pointsRows: RoomRankingsResponse["rows"];
  winsRows: RoomRankingsResponse["rows"];
  streakRows: RoomRankingsResponse["rows"];
  participationRows: RoomRankingsResponse["rows"];
  gameWinRows: Record<string, RoomRankingsResponse["rows"]>;
  myRanks: Partial<Record<RoomRankingBoard, { rank: number | null; value: number }>>;
  memberStats: RoomMemberStatRow[];
  canViewEngagement: boolean;
};

function buildPanelData(
  pointsRes: { ok: true; data: RoomRankingsResponse },
  winsRes: { ok: true; data: RoomRankingsResponse },
  streakRes: { ok: true; data: RoomRankingsResponse },
  participationRes: { ok: true; data: RoomRankingsResponse },
  gameWinResults: Array<{ ok: true; data: RoomRankingsResponse } | { ok: false }>,
  statsRes: { ok: true; data: { rows: RoomMemberStatRow[]; can_view_engagement: boolean } } | { ok: false },
): RoomRankingsPanelData {
  const perGame: Record<string, RoomRankingsResponse["rows"]> = {};
  GAME_WIN_EVENT_TYPES.forEach((eventType, index) => {
    const res = gameWinResults[index];
    perGame[eventType] = res?.ok ? res.data.rows : [];
  });

  return {
    pointsRows: pointsRes.data.rows,
    winsRows: winsRes.data.rows,
    streakRows: streakRes.data.rows,
    participationRows: participationRes.data.rows,
    gameWinRows: perGame,
    myRanks: {
      points: pointsRes.data.my_rank ?? undefined,
      wins: winsRes.data.my_rank ?? undefined,
      streak: streakRes.data.my_rank ?? undefined,
      participation: participationRes.data.my_rank ?? undefined,
    },
    memberStats: statsRes.ok ? statsRes.data.rows : [],
    canViewEngagement: statsRes.ok ? statsRes.data.can_view_engagement : false,
  };
}

export async function fetchAllRoomRankingsPanelData(
  roomSlug: string,
  period: RoomRankingPeriod,
  refresh = false,
) {
  const gameWinPromises = GAME_WIN_EVENT_TYPES.map((eventType) =>
    fetchRoomRankings(roomSlug, period, "wins", eventType),
  );

  if (refresh) {
    const pointsRes = await fetchRoomRankings(roomSlug, period, "points", undefined, true);
    if (!pointsRes.ok) {
      return {
        ok: false as const,
        error: pointsRes.error,
        throttled: "throttled" in pointsRes ? pointsRes.throttled : undefined,
        retryAfterSec: "retryAfterSec" in pointsRes ? pointsRes.retryAfterSec : undefined,
      };
    }

    const [winsRes, streakRes, participationRes, statsRes, ...gameWinResults] =
      await Promise.all([
        fetchRoomRankings(roomSlug, period, "wins"),
        fetchRoomRankings(roomSlug, period, "streak"),
        fetchRoomRankings(roomSlug, period, "participation"),
        fetchRoomMemberStats(roomSlug),
        ...gameWinPromises,
      ]);

    if (!winsRes.ok || !streakRes.ok || !participationRes.ok) {
      const err = !winsRes.ok
        ? winsRes.error
        : !streakRes.ok
          ? streakRes.error
          : participationRes.error;
      return { ok: false as const, error: err ?? "Falha ao carregar rankings." };
    }

    return {
      ok: true as const,
      data: buildPanelData(
        pointsRes,
        winsRes,
        streakRes,
        participationRes,
        gameWinResults,
        statsRes,
      ),
    };
  }

  const [pointsRes, winsRes, streakRes, participationRes, statsRes, ...gameWinResults] =
    await Promise.all([
      fetchRoomRankings(roomSlug, period, "points"),
      fetchRoomRankings(roomSlug, period, "wins"),
      fetchRoomRankings(roomSlug, period, "streak"),
      fetchRoomRankings(roomSlug, period, "participation"),
      fetchRoomMemberStats(roomSlug),
      ...gameWinPromises,
    ]);

  if (!pointsRes.ok || !winsRes.ok || !streakRes.ok || !participationRes.ok) {
    const err = !pointsRes.ok
      ? pointsRes.error
      : !winsRes.ok
        ? winsRes.error
        : !streakRes.ok
          ? streakRes.error
          : participationRes.error;
    return { ok: false as const, error: err ?? "Falha ao carregar rankings." };
  }

  return {
    ok: true as const,
    data: buildPanelData(pointsRes, winsRes, streakRes, participationRes, gameWinResults, statsRes),
  };
}

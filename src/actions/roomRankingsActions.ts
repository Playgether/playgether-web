"use server";

import { api } from "@/services/api";
import type { RoomMemberStatRow, RoomRankingsResponse } from "@/types/RoomRankings";
import { cookies } from "next/headers";

export type RoomRankingPeriod = "daily" | "weekly" | "monthly" | "all";
export type RoomRankingBoard = "points" | "wins" | "streak" | "participation";

async function authHeaders() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return null;
  return { Authorization: `Bearer ${accessToken}` };
}

export async function fetchRoomRankings(
  roomSlug: string,
  period: RoomRankingPeriod = "weekly",
  board: RoomRankingBoard = "points",
) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const qs = new URLSearchParams({ period, board });
    const res = await api.get<RoomRankingsResponse>(
      `/api/v1/chatrooms/${encodeURIComponent(roomSlug)}/rankings/?${qs}`,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch {
    return { ok: false as const, error: "Falha ao carregar rankings." };
  }
}

export async function fetchRoomMemberStats(roomSlug: string) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const res = await api.get<{ rows: RoomMemberStatRow[]; can_view_engagement: boolean }>(
      `/api/v1/chatrooms/${encodeURIComponent(roomSlug)}/member-stats/`,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch {
    return { ok: false as const, error: "Falha ao carregar estatísticas." };
  }
}

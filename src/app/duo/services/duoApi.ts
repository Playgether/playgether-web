import { apiFetch } from "@/services/apiFetch";
import type {
  DuoMatch,
  DuoQueue,
  GamePreferences,
  GameSchema,
  StatsResponse,
} from "../types/duo";

/** Proxied by Next.js Route Handlers — reads httpOnly `accessToken` and sends Bearer to Django. */
const BASE = "/api/duo";

// ─── Queue ────────────────────────────────────────────────────────────────────

export async function getActiveQueues(): Promise<DuoQueue[]> {
  const res = await apiFetch(`${BASE}/queue`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch duo queues");
  return res.json();
}

export async function enterQueue(
  game_slug: string,
  preferences: Partial<GamePreferences>
): Promise<DuoQueue> {
  const res = await apiFetch(`${BASE}/queue`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game_slug, preferences }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).detail || "Failed to enter queue");
  }
  return res.json();
}

export async function leaveQueue(queueId: number): Promise<void> {
  await apiFetch(`${BASE}/queue/${queueId}`, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function renewQueue(queueId: number): Promise<DuoQueue> {
  const res = await apiFetch(`${BASE}/queue/${queueId}/renew`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).detail || "Failed to renew queue");
  }
  return res.json();
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function getMatches(game_slug?: string): Promise<DuoMatch[]> {
  const url = game_slug
    ? `${BASE}/matches?game_slug=${encodeURIComponent(game_slug)}`
    : `${BASE}/matches`;
  const res = await apiFetch(url, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch duo matches");
  return res.json();
}

// ─── Schema ───────────────────────────────────────────────────────────────────

export async function getGameSchema(game_slug: string): Promise<GameSchema> {
  const res = await apiFetch(`${BASE}/schema/${encodeURIComponent(game_slug)}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`No schema for '${game_slug}'`);
  return res.json();
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getGameStats(game_slug: string): Promise<StatsResponse> {
  const res = await apiFetch(`${BASE}/stats/${encodeURIComponent(game_slug)}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Failed to fetch stats for '${game_slug}'`);
  return res.json();
}

// ─── Games list (re-export from global service) ───────────────────────────────

export type { GameDetails } from "@/services/getGames";
export { getGames } from "@/services/getGames";

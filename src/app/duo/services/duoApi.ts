import { apiFetch } from "@/services/apiFetch";
import type {
  DuoInvite,
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

export async function sendDuoInvite(matchId: number): Promise<{ detail: string }> {
  const res = await apiFetch(`${BASE}/matches/${matchId}/invite`, {
    method: "POST",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail || "Não foi possível enviar o convite.");
  }
  return body as { detail: string };
}

export async function getDuoInvites(options?: {
  game_slug?: string;
  direction?: "received" | "sent" | "all";
  status?: "pending" | "accepted" | "declined" | "cancelled" | "all";
}): Promise<DuoInvite[]> {
  const params = new URLSearchParams();
  if (options?.game_slug) params.set("game_slug", options.game_slug);
  if (options?.direction) params.set("direction", options.direction);
  if (options?.status) params.set("status", options.status);
  const qs = params.toString();
  const res = await apiFetch(`${BASE}/invites${qs ? `?${qs}` : ""}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch duo invites");
  return res.json();
}

export async function acceptDuoInvite(inviteId: number): Promise<DuoInvite> {
  const res = await apiFetch(`${BASE}/invites/${inviteId}/accept`, {
    method: "POST",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail || "Não foi possível aceitar o convite.");
  }
  return body as DuoInvite;
}

export async function declineDuoInvite(inviteId: number): Promise<{ detail: string }> {
  const res = await apiFetch(`${BASE}/invites/${inviteId}/decline`, {
    method: "POST",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail || "Não foi possível recusar o convite.");
  }
  return body as { detail: string };
}

export async function undoDeclineDuoInvite(
  inviteId: number,
): Promise<{ id: number; match_id: number; status: "cancelled"; direction: "received" }> {
  const res = await apiFetch(`${BASE}/invites/${inviteId}/undo-decline`, {
    method: "POST",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (body as { detail?: string }).detail || "Não foi possível restaurar o convite.",
    );
  }
  return body as {
    id: number;
    match_id: number;
    status: "cancelled";
    direction: "received";
  };
}

export async function cancelDuoInvite(inviteId: number): Promise<{ detail: string }> {
  const res = await apiFetch(`${BASE}/invites/${inviteId}/cancel`, {
    method: "POST",
    credentials: "include",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { detail?: string }).detail || "Não foi possível cancelar o convite.");
  }
  return body as { detail: string };
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

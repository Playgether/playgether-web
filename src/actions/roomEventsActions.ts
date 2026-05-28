"use server";

import { api } from "@/services/api";
import type { RoomEvent, RoomEventMessage } from "@/types/RoomEvents";
import { cookies } from "next/headers";

async function authHeaders() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return null;
  return { Authorization: `Bearer ${accessToken}` };
}

type RoomEventListBody = RoomEvent[] | { results?: RoomEvent[] };

function normalizeRoomEventList(body: RoomEventListBody | undefined): RoomEvent[] {
  if (!body) return [];
  if (Array.isArray(body)) return body;
  return body.results ?? [];
}

export async function listRoomEvents(roomSlug: string, opts?: { activeOnly?: boolean }) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const active = opts?.activeOnly ? "&active=1" : "";
    const res = await api.get<RoomEventListBody>(
      `/api/v1/room-events/?room_slug=${encodeURIComponent(roomSlug)}${active}`,
      { headers }
    );
    return { ok: true as const, data: normalizeRoomEventList(res.data) };
  } catch {
    return { ok: false as const, error: "Falha ao listar eventos." };
  }
}

export async function fetchRoomEvent(eventId: number) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const res = await api.get<RoomEvent>(`/api/v1/room-events/${eventId}/`, { headers });
    return { ok: true as const, data: res.data };
  } catch {
    return { ok: false as const, error: "Falha ao carregar evento." };
  }
}

export async function fetchRoomEventMessages(eventId: number) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const res = await api.get<RoomEventMessage[]>(`/api/v1/room-events/${eventId}/messages/`, { headers });
    return { ok: true as const, data: res.data ?? [] };
  } catch {
    return { ok: false as const, error: "Falha ao carregar mensagens do evento." };
  }
}

export async function createRoomEvent(payload: {
  room: number;
  title: string;
  event_type: "vote_best" | "quiz_elimination" | "button_quiz";
  rounds_total?: number;
  answer_time_sec?: number;
  vote_time_sec?: number;
  join_window_sec?: number;
}) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const res = await api.post<RoomEvent>("/api/v1/room-events/", payload, { headers });
    return { ok: true as const, data: res.data };
  } catch {
    return { ok: false as const, error: "Falha ao criar evento." };
  }
}

export async function joinRoomEvent(eventId: number) {
  return roomEventPostAction(eventId, "join");
}

export async function rejectRoomEventInvite(eventId: number) {
  return roomEventPostAction(eventId, "reject-invite");
}

export async function beginAfterRecruitment(eventId: number) {
  return roomEventPostAction(eventId, "begin-after-recruitment");
}

export async function deleteRoomEventMessage(eventId: number, messageId: number) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    await api.delete(`/api/v1/room-events/${eventId}/messages/${messageId}/`, {
      headers,
    });
    return { ok: true as const };
  } catch (e: unknown) {
    const raw = (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail;
    return {
      ok: false as const,
      error: (typeof raw === "string" && raw) || "Não foi possível excluir a mensagem.",
    };
  }
}

export async function roomEventPostAction(eventId: number, action: string, body?: Record<string, unknown>) {
  const headers = await authHeaders();
  if (!headers) return { ok: false as const, error: "Não autenticado." };
  try {
    const res = await api.post(`/api/v1/room-events/${eventId}/${action}/`, body ?? {}, { headers });
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    const raw = (e as { response?: { data?: { detail?: string | string[] } } })?.response?.data?.detail;
    const detail = Array.isArray(raw) ? raw.join(" ") : raw;
    return { ok: false as const, error: (typeof detail === "string" && detail) || "Ação falhou." };
  }
}

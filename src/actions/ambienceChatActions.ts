"use server";

import { api } from "@/services/api";
import type { RoomAmbienceMessage } from "@/types/RoomAmbience";
import { cookies } from "next/headers";

type PaginatedAmbienceMessages = {
  results?: RoomAmbienceMessage[];
  next?: string | null;
};

async function authHeaders() {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return null;
  return { Authorization: `Bearer ${accessToken}` };
}

function normalizeAmbienceMessage(raw: Record<string, unknown>): RoomAmbienceMessage | null {
  const id = typeof raw.id === "number" ? raw.id : 0;
  const body = typeof raw.body === "string" ? raw.body : "";
  if (!id || !body) return null;
  const author_user_id =
    typeof raw.author_user_id === "string" ? raw.author_user_id : null;
  const reply_to_id =
    typeof raw.reply_to_id === "number" && raw.reply_to_id > 0
      ? raw.reply_to_id
      : undefined;
  return {
    id,
    author_user_id,
    author_username:
      typeof raw.author_username === "string" ? raw.author_username : "",
    author_photo:
      typeof raw.author_photo === "string" ? raw.author_photo : undefined,
    body,
    created_at_ms:
      typeof raw.created_at_ms === "number"
        ? raw.created_at_ms
        : typeof raw.created_at === "string"
          ? Date.parse(raw.created_at)
          : 0,
    is_system: Boolean(raw.is_system) || author_user_id === null,
    reply_to_id,
    reply_to_username:
      typeof raw.reply_to_username === "string" ? raw.reply_to_username : undefined,
    reply_to_body:
      typeof raw.reply_to_body === "string" ? raw.reply_to_body : undefined,
  };
}

/** Carrega até `limit` mensagens recentes do histórico persistido da transmissão. */
export async function fetchAmbienceChatHistory(
  roomSlug: string,
  sessionId: string,
  limit = 200,
): Promise<{ ok: true; data: RoomAmbienceMessage[] } | { ok: false; error: string }> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, error: "Não autenticado." };
  const segment = encodeURIComponent(roomSlug);
  const session = sessionId.trim();
  if (!session) return { ok: true, data: [] };
  const collected: RoomAmbienceMessage[] = [];
  let url: string | null =
    `/api/v1/chatrooms/${segment}/ambience-messages/?page_size=${Math.min(limit, 50)}&session_id=${encodeURIComponent(session)}`;

  try {
    while (url && collected.length < limit) {
      const res = await api.get<PaginatedAmbienceMessages>(url, { headers });
      const page = res.data?.results ?? [];
      for (const item of page) {
        const row = normalizeAmbienceMessage(item as unknown as Record<string, unknown>);
        if (row) collected.push(row);
      }
      if (collected.length >= limit) break;
      const next = res.data?.next;
      if (!next) break;
      try {
        const parsed = new URL(next);
        url = `${parsed.pathname}${parsed.search}`;
      } catch {
        url = null;
      }
    }
    collected.sort((a, b) => a.created_at_ms - b.created_at_ms);
    return { ok: true, data: collected.slice(-limit) };
  } catch {
    return { ok: false, error: "Falha ao carregar histórico do chat da transmissão." };
  }
}

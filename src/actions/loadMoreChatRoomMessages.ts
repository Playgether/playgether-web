"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import type { ChatRoomDetailedBody } from "@/services/chatRoomApi";

/** Carrega página seguinte de mensagens (cursor DRF) — tipicamente mensagens mais antigas. */
export async function loadMoreChatRoomMessages(nextUrl: string) {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token) {
    return { ok: false as const, error: "Não autenticado." };
  }
  let pathWithSearch: string;
  try {
    const u = new URL(nextUrl);
    pathWithSearch = u.pathname + u.search;
  } catch {
    const base =
      process.env.baseUrl ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://127.0.0.1";
    try {
      const u = new URL(nextUrl, base);
      pathWithSearch = u.pathname + u.search;
    } catch {
      pathWithSearch = nextUrl.startsWith("/") ? nextUrl : `/${nextUrl}`;
    }
  }
  try {
    const res = await api.get<ChatRoomDetailedBody>(pathWithSearch, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: true as const, data: res.data ?? null };
  } catch {
    return {
      ok: false as const,
      error: "Não foi possível carregar mensagens antigas.",
    };
  }
}

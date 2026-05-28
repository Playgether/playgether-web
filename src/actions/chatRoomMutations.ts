"use server";

import { api } from "@/services/api";
import { ChatRoom } from "@/types/ChatRoom";
import { ChatRules } from "@/types/ChatRules";
import { cookies } from "next/headers";

async function bearerHeaders(): Promise<
  { Authorization: string } | { error: string }
> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return { error: "Não autenticado." };
  return { Authorization: `Bearer ${accessToken}` };
}

export async function patchChatRoomSettings(
  roomSlug: string,
  body: Partial<{
    group_name: string;
    summary: string;
    slug: string;
    banner: string | null;
    description: string;
    ambient_images: Record<string, string>;
  }>
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.patch<ChatRoom>(
      `/api/v1/chatrooms/${segment}/settings/`,
      body,
      { headers }
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    const detail = (e as { response?: { data?: { detail?: string } } })?.response
      ?.data?.detail;
    return {
      ok: false as const,
      error: typeof detail === "string" ? detail : "Não foi possível salvar.",
    };
  }
}

export async function createChatRoomRule(roomSlug: string, description: string) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.post<ChatRules>(
      `/api/v1/chatrooms/${segment}/rules/`,
      { description },
      { headers }
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    const detail = (e as { response?: { data?: { detail?: string } } })?.response
      ?.data?.detail;
    return {
      ok: false as const,
      error: typeof detail === "string" ? detail : "Não foi possível criar a regra.",
    };
  }
}

export async function updateChatRoomRule(
  roomSlug: string,
  ruleId: number,
  description: string
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.patch<ChatRules>(
      `/api/v1/chatrooms/${segment}/rules/${ruleId}/`,
      { description },
      { headers }
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    const detail = (e as { response?: { data?: { detail?: string } } })?.response
      ?.data?.detail;
    return {
      ok: false as const,
      error: typeof detail === "string" ? detail : "Não foi possível atualizar a regra.",
    };
  }
}

export async function deleteChatRoomRule(roomSlug: string, ruleId: number) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.delete(`/api/v1/chatrooms/${segment}/rules/${ruleId}/`, {
      headers,
    });
    return { ok: true as const };
  } catch (e: unknown) {
    const detail = (e as { response?: { data?: { detail?: string } } })?.response
      ?.data?.detail;
    return {
      ok: false as const,
      error: typeof detail === "string" ? detail : "Não foi possível excluir a regra.",
    };
  }
}

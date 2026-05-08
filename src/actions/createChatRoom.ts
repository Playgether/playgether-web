"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";

export type CreateChatRoomInput = {
  group_name: string;
  summary: string;
  description: string;
  banner: string;
  /** Opcional; se vazio, o backend gera a partir do nome. */
  slug?: string;
};

export async function createChatRoom(input: CreateChatRoomInput) {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) {
    return { ok: false as const, error: "Não autenticado." };
  }

  const body: Record<string, string> = {
    group_name: input.group_name.trim(),
    summary: input.summary.trim(),
    description: input.description.trim(),
    banner: input.banner.trim(),
  };
  const rawSlug = (input.slug ?? "").trim();
  if (rawSlug) {
    body.slug = rawSlug;
  }

  if (!body.group_name || !body.summary || !body.description || !body.banner) {
    return { ok: false as const, error: "Preencha todos os campos obrigatórios." };
  }

  try {
    const res = await api.post<{ id: number; slug: string }>(
      "/api/v1/chatrooms/",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const slug = res.data?.slug;
    if (typeof slug !== "string" || !slug) {
      return { ok: false as const, error: "Resposta inválida do servidor." };
    }
    return { ok: true as const, slug };
  } catch (e: unknown) {
    const err = e as {
      response?: { data?: Record<string, string[] | string | unknown> };
    };
    const data = err.response?.data;
    if (data && typeof data === "object") {
      const groupNameErr = (data as Record<string, unknown>).group_name;
      if (Array.isArray(groupNameErr) && groupNameErr[0] != null) {
        return { ok: false as const, error: String(groupNameErr[0]) };
      }
      if (typeof groupNameErr === "string" && groupNameErr) {
        return { ok: false as const, error: groupNameErr };
      }
      const slugErr = (data as Record<string, unknown>).slug;
      if (Array.isArray(slugErr) && slugErr[0] != null) {
        return { ok: false as const, error: String(slugErr[0]) };
      }
      if (typeof slugErr === "string" && slugErr) {
        return { ok: false as const, error: slugErr };
      }
      const detail = (data as { detail?: string }).detail;
      if (typeof detail === "string") {
        return { ok: false as const, error: detail };
      }
      const firstKey = Object.keys(data)[0];
      const val = firstKey ? (data as Record<string, unknown>)[firstKey] : null;
      const msg = Array.isArray(val)
        ? String(val[0])
        : typeof val === "string"
          ? val
          : "Não foi possível criar a sala.";
      return { ok: false as const, error: msg };
    }
    return { ok: false as const, error: "Não foi possível criar a sala." };
  }
}

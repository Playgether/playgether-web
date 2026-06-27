"use server";

import { api } from "@/services/api";
import type {
  PermissionCatalogCategory,
  RoomPermissionsSnapshot,
  RoomRole,
} from "@/types/RoomPermissions";
import { cookies } from "next/headers";

async function bearerHeaders(): Promise<
  { Authorization: string } | { error: string }
> {
  const accessToken = (await cookies()).get("accessToken")?.value;
  if (!accessToken) return { error: "Não autenticado." };
  return { Authorization: `Bearer ${accessToken}` };
}

function parseError(e: unknown, fallback: string): string {
  const detail = (e as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export async function fetchPermissionsCatalog(): Promise<
  { ok: true; categories: PermissionCatalogCategory[] } | { ok: false; error: string }
> {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false, error: headers.error };
  try {
    const res = await api.get<{ categories: PermissionCatalogCategory[] }>(
      "/api/v1/chatrooms/permissions-catalog/",
      { headers },
    );
    return { ok: true, categories: res.data.categories ?? [] };
  } catch (e: unknown) {
    return { ok: false, error: parseError(e, "Não foi possível carregar permissões.") };
  }
}

export async function fetchRoomPermissions(roomSlug: string): Promise<
  { ok: true; data: RoomPermissionsSnapshot } | { ok: false; error: string }
> {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.get<RoomPermissionsSnapshot>(
      `/api/v1/chatrooms/${segment}/permissions/`,
      { headers },
    );
    return { ok: true, data: res.data };
  } catch (e: unknown) {
    return { ok: false, error: parseError(e, "Não foi possível carregar cargos.") };
  }
}

export async function createRoomRole(
  roomSlug: string,
  body: { name: string; permissions: string[]; color?: string },
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.post<RoomRole>(
      `/api/v1/chatrooms/${segment}/roles/`,
      body,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    return { ok: false as const, error: parseError(e, "Não foi possível criar o cargo.") };
  }
}

export async function updateRoomRole(
  roomSlug: string,
  roleId: number,
  body: Partial<{ name: string; permissions: string[]; color: string }>,
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.patch<RoomRole>(
      `/api/v1/chatrooms/${segment}/roles/${roleId}/`,
      body,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    return { ok: false as const, error: parseError(e, "Não foi possível atualizar o cargo.") };
  }
}

export async function deleteRoomRole(roomSlug: string, roleId: number) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.delete(`/api/v1/chatrooms/${segment}/roles/${roleId}/`, { headers });
    return { ok: true as const };
  } catch (e: unknown) {
    return { ok: false as const, error: parseError(e, "Não foi possível excluir o cargo.") };
  }
}

export async function assignRoomRole(
  roomSlug: string,
  roleId: number,
  userId: number,
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.post(
      `/api/v1/chatrooms/${segment}/roles/${roleId}/assign/`,
      { user_id: userId },
      { headers },
    );
    return { ok: true as const };
  } catch (e: unknown) {
    return { ok: false as const, error: parseError(e, "Não foi possível atribuir o cargo.") };
  }
}

export async function unassignRoomRole(
  roomSlug: string,
  roleId: number,
  userId: number,
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.delete(`/api/v1/chatrooms/${segment}/roles/${roleId}/assign/`, {
      headers,
      data: { user_id: userId },
    });
    return { ok: true as const };
  } catch (e: unknown) {
    return { ok: false as const, error: parseError(e, "Não foi possível remover o cargo.") };
  }
}

export async function reorderRoomRoles(roomSlug: string, order: number[]) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.post<RoomRole[]>(
      `/api/v1/chatrooms/${segment}/roles/reorder/`,
      { order },
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    return {
      ok: false as const,
      error: parseError(e, "Não foi possível reordenar os cargos."),
    };
  }
}

export async function kickRoomMember(
  roomSlug: string,
  userId: number,
  options?: {
    reason?: string;
    durationSeconds?: number | null;
    scope?: "room" | "ambience";
  },
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const body: Record<string, unknown> = {
      user_id: userId,
      reason: options?.reason,
      scope: options?.scope ?? "room",
    };
    if (options?.durationSeconds !== undefined) {
      body.duration_seconds = options.durationSeconds;
    }
    await api.post(`/api/v1/chatrooms/${segment}/kick-member/`, body, { headers });
    return { ok: true as const };
  } catch (e: unknown) {
    return { ok: false as const, error: parseError(e, "Não foi possível expulsar o membro.") };
  }
}

export async function muteRoomMember(
  roomSlug: string,
  userId: number,
  options?: { reason?: string; durationSeconds?: number | null },
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const body: Record<string, unknown> = {
      user_id: userId,
      reason: options?.reason,
    };
    if (options?.durationSeconds !== undefined) {
      body.duration_seconds = options.durationSeconds;
    }
    await api.post(`/api/v1/chatrooms/${segment}/mute-member/`, body, { headers });
    return { ok: true as const };
  } catch (e: unknown) {
    return {
      ok: false as const,
      error: parseError(e, "Não foi possível silenciar o membro."),
    };
  }
}

export type RoomActiveSanctionRow = {
  id: number;
  user_id: number;
  username: string;
  fullname: string;
  profile_photo: string;
  sanction_type: "mute" | "ban" | "ambience_ban";
  expires_at: string | null;
  remaining_seconds: number | null;
  is_permanent: boolean;
  reason: string;
  created_at: string;
};

export async function listRoomActiveSanctions(roomSlug: string) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    const res = await api.get<RoomActiveSanctionRow[]>(
      `/api/v1/chatrooms/${segment}/active-sanctions/`,
      { headers },
    );
    return { ok: true as const, data: res.data };
  } catch (e: unknown) {
    return {
      ok: false as const,
      error: parseError(e, "Não foi possível carregar sanções ativas."),
    };
  }
}

export async function revokeRoomSanction(
  roomSlug: string,
  userId: number,
  sanctionType: "mute" | "ban" | "ambience_ban",
) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.post(
      `/api/v1/chatrooms/${segment}/revoke-sanction/`,
      { user_id: userId, sanction_type: sanctionType },
      { headers },
    );
    return { ok: true as const };
  } catch (e: unknown) {
    return {
      ok: false as const,
      error: parseError(e, "Não foi possível remover a sanção."),
    };
  }
}

export async function deleteAmbienceMessage(roomSlug: string, messageId: number) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.delete(`/api/v1/chatrooms/${segment}/ambience-messages/${messageId}/`, {
      headers,
    });
    return { ok: true as const };
  } catch (e: unknown) {
    return {
      ok: false as const,
      error: parseError(e, "Não foi possível excluir a mensagem da transmissão."),
    };
  }
}

export async function deleteChatRoomMessage(roomSlug: string, messageId: number) {
  const headers = await bearerHeaders();
  if ("error" in headers) return { ok: false as const, error: headers.error };
  try {
    const segment = encodeURIComponent(String(roomSlug).trim());
    await api.delete(`/api/v1/chatrooms/${segment}/messages/${messageId}/`, {
      headers,
    });
    return { ok: true as const };
  } catch (e: unknown) {
    return {
      ok: false as const,
      error: parseError(e, "Não foi possível excluir a mensagem."),
    };
  }
}

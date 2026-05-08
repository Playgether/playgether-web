"use server";

import { api } from "@/services/api";
import { ProfileProps } from "@/types/ProfileProps";
import { cookies } from "next/headers";
import jwt_decode from "jwt-decode";

/**
 * Retorna só o JSON do perfil (serializável).
 * Não retorne o objeto Axios inteiro em Server Actions — o cliente não recebe `response.data` de forma confiável.
 */
export async function getProfile(): Promise<ProfileProps | null> {
  const jar = await cookies();
  const accessToken = jar.get("accessToken")?.value;
  let userId = jar.get("user_id")?.value;

  if (!accessToken) return null;

  if (!userId) {
    try {
      const payload = jwt_decode<{ user_id?: number | string }>(accessToken);
      if (payload?.user_id != null && String(payload.user_id) !== "") {
        userId = String(payload.user_id);
      }
    } catch {
      /* ignore */
    }
  }

  if (!userId) return null;

  try {
    const { data } = await api.get<ProfileProps>(
      `/api/v1/users/${userId}/profiles/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return data ?? null;
  } catch {
    return null;
  }
}

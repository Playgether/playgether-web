"use server";

import { api } from "@/services/api";
import { ProfileProps } from "@/types/ProfileProps";
import { ensureSessionAuth } from "@/actions/refreshToken";

/**
 * Retorna só o JSON do perfil (serializável).
 * Não retorne o objeto Axios inteiro em Server Actions — o cliente não recebe `response.data` de forma confiável.
 */
export async function getProfile(): Promise<ProfileProps | null> {
  const session = await ensureSessionAuth();
  if (!session) return null;

  try {
    const { data } = await api.get<ProfileProps>(
      `/api/v1/users/${session.userId}/profiles/`,
      {
        headers: {
          Authorization: `Bearer ${session.access}`,
        },
      },
    );
    return data ?? null;
  } catch {
    return null;
  }
}

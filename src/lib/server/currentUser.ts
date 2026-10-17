import "server-only";

import { cache } from "react";
import { api } from "@/services/api";
import { ensureAccessTokenCookie } from "@/lib/server/authTokens";

/**
 * Username do usuário autenticado (cookie httpOnly → API).
 * O access JWT só carrega user_id; username vem de /users/me/.
 */
export const getCurrentUsername = cache(async (): Promise<string | null> => {
  const access = await ensureAccessTokenCookie();
  if (!access) return null;

  try {
    const { data } = await api.get<{ username?: string }>("/api/v1/users/me/", {
      headers: { Authorization: `Bearer ${access}` },
    });
    return data?.username ?? null;
  } catch {
    return null;
  }
});

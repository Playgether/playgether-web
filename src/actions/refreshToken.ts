"use server";

import { refreshCookiesFromRefreshToken } from "@/lib/server/authTokens";

/**
 * Atualiza o access token usando o refresh token.
 * Retorna false se o refresh falhar (sessão expirada → logout).
 */
export async function refreshTokenServer(): Promise<boolean> {
  const r = await refreshCookiesFromRefreshToken();
  return r.ok;
}

"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

type RefreshCookiesResult = { ok: true; access: string } | { ok: false };

export async function refreshCookiesFromRefreshToken(): Promise<RefreshCookiesResult> {
  const cookiesInstance = await cookies();
  const refreshToken = cookiesInstance.get("refreshToken")?.value;

  if (!refreshToken) return { ok: false };

  try {
    const response = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });

    const { access, refresh: newRefresh } = response.data;
    const decodedAccess = jwt_decode<{ user_id: string | number; exp?: number }>(access);

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = isProduction
      ? { httpOnly: true, secure: true, sameSite: "lax" as const }
      : { httpOnly: true, secure: false, sameSite: "lax" as const };

    // maxAge alinhado ao exp do JWT — cookie some exatamente quando o token expira
    const accessMaxAge = decodedAccess.exp
      ? Math.max(Math.floor(decodedAccess.exp - Date.now() / 1000), 1)
      : 3600;

    cookiesInstance.set("accessToken", access, { ...cookieOptions, maxAge: accessMaxAge });
    if (newRefresh) {
      cookiesInstance.set("refreshToken", newRefresh, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30,
      });
    }
    cookiesInstance.set("user_id", String(decodedAccess.user_id), cookieOptions);

    return { ok: true, access };
  } catch {
    return { ok: false };
  }
}

/**
 * Atualiza o access token usando o refresh token.
 * Retorna false se o refresh falhar (sessão expirada → logout).
 */
export async function refreshTokenServer(): Promise<boolean> {
  const r = await refreshCookiesFromRefreshToken();
  return r.ok;
}

/**
 * Para Server Components / rotas proxy: retorna o access token válido.
 * Se o access estiver ausente ou expirado, tenta renovar com o refresh token.
 */
export async function ensureAccessTokenCookie(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get("accessToken")?.value;

  if (existing) {
    try {
      const decoded = jwt_decode<{ exp?: number }>(existing);
      // Retorna o token existente só se ainda não expirou
      if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
        return existing;
      }
    } catch {
      // token malformado — cai no refresh
    }
  }

  // Sem token válido → renova
  const r = await refreshCookiesFromRefreshToken();
  return r.ok ? r.access : null;
}

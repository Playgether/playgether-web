"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";
import {
  AUTH_COOKIE_BASE,
  REFRESH_TOKEN_MAX_AGE_SEC,
  accessTokenMaxAgeSec,
  isValidUserId,
} from "@/lib/authCookies";

type RefreshCookiesResult = { ok: true; access: string } | { ok: false };

/** Evita refresh paralelo com rotação de token (blacklist do token antigo). */
let refreshInFlight: Promise<RefreshCookiesResult> | null = null;

async function doRefreshCookiesFromRefreshToken(): Promise<RefreshCookiesResult> {
  const cookiesInstance = await cookies();
  const refreshToken = cookiesInstance.get("refreshToken")?.value;

  if (!refreshToken) return { ok: false };

  try {
    const response = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });

    const { access, refresh: newRefresh } = response.data;
    const decodedAccess = jwt_decode<{ user_id: string | number; exp?: number }>(access);

    if (decodedAccess.user_id == null) return { ok: false };

    cookiesInstance.set("accessToken", access, {
      ...AUTH_COOKIE_BASE,
      maxAge: accessTokenMaxAgeSec(decodedAccess.exp),
    });
    if (newRefresh) {
      cookiesInstance.set("refreshToken", newRefresh, {
        ...AUTH_COOKIE_BASE,
        maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
      });
    }
    // Mesma vida do refresh — precisa sobreviver ao fechar o navegador
    cookiesInstance.set("user_id", String(decodedAccess.user_id), {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });

    return { ok: true, access };
  } catch {
    return { ok: false };
  }
}

export async function refreshCookiesFromRefreshToken(): Promise<RefreshCookiesResult> {
  if (!refreshInFlight) {
    refreshInFlight = doRefreshCookiesFromRefreshToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
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
 * Também regrava `user_id` se o cookie de sessão tiver sumido.
 */
export async function ensureAccessTokenCookie(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get("accessToken")?.value;
  const existingUserId = jar.get("user_id")?.value;

  if (existing) {
    try {
      const decoded = jwt_decode<{ exp?: number; user_id?: string | number }>(existing);
      if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
        if (
          decoded.user_id != null &&
          !isValidUserId(existingUserId)
        ) {
          jar.set("user_id", String(decoded.user_id), {
            ...AUTH_COOKIE_BASE,
            maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
          });
        }
        return existing;
      }
    } catch {
      // token malformado — cai no refresh
    }
  }

  const r = await refreshCookiesFromRefreshToken();
  return r.ok ? r.access : null;
}

/**
 * Garante access válido e devolve o user_id (cookie ou JWT).
 * Nunca devolve o literal "undefined".
 */
export async function ensureSessionAuth(): Promise<{
  access: string;
  userId: string;
} | null> {
  const access = await ensureAccessTokenCookie();
  if (!access) return null;

  const jar = await cookies();
  let userId = jar.get("user_id")?.value;

  if (!isValidUserId(userId)) {
    try {
      const payload = jwt_decode<{ user_id?: string | number }>(access);
      if (payload.user_id != null) {
        userId = String(payload.user_id);
        jar.set("user_id", userId, {
          ...AUTH_COOKIE_BASE,
          maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
        });
      }
    } catch {
      return null;
    }
  }

  if (!isValidUserId(userId)) return null;
  return { access, userId };
}

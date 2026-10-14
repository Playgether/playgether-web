import "server-only";

import { cookies } from "next/headers";
import jwt_decode from "jwt-decode";
import { api } from "@/services/api";
import {
  AUTH_COOKIE_BASE,
  REFRESH_TOKEN_MAX_AGE_SEC,
  accessTokenMaxAgeSec,
  isValidUserId,
} from "@/lib/authCookies";

type RefreshCookiesResult = { ok: true; access: string } | { ok: false };

type RotatedTokens = {
  access: string;
  refresh: string | null;
  userId: string;
  exp?: number;
};

/** Keyed by refresh token: concurrent calls of the same session share one backend call. */
const refreshInFlight = new Map<string, Promise<RotatedTokens | null>>();

async function rotateAtBackend(refreshToken: string): Promise<RotatedTokens | null> {
  try {
    const response = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });
    const { access, refresh: newRefresh } = response.data;
    const decodedAccess = jwt_decode<{
      user_id: string | number;
      exp?: number;
    }>(access);
    if (decodedAccess.user_id == null) return null;
    return {
      access,
      refresh: newRefresh ?? null,
      userId: String(decodedAccess.user_id),
      exp: decodedAccess.exp,
    };
  } catch {
    return null;
  }
}

/**
 * Server Components can't write cookies. Rotating the refresh token there would blacklist
 * the old one on the backend while the browser keeps it, killing the session.
 */
function canWriteCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  refreshToken: string,
): boolean {
  try {
    cookieStore.set("refreshToken", refreshToken, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
    return true;
  } catch {
    return false;
  }
}

export async function refreshCookiesFromRefreshToken(): Promise<RefreshCookiesResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken || !canWriteCookies(cookieStore, refreshToken)) {
    return { ok: false };
  }

  let pending = refreshInFlight.get(refreshToken);
  if (!pending) {
    pending = rotateAtBackend(refreshToken).finally(() => {
      refreshInFlight.delete(refreshToken);
    });
    refreshInFlight.set(refreshToken, pending);
  }
  const tokens = await pending;
  if (!tokens) return { ok: false };

  cookieStore.set("accessToken", tokens.access, {
    ...AUTH_COOKIE_BASE,
    maxAge: accessTokenMaxAgeSec(tokens.exp),
  });
  if (tokens.refresh) {
    cookieStore.set("refreshToken", tokens.refresh, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
  }
  cookieStore.set("user_id", tokens.userId, {
    ...AUTH_COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
  });

  return { ok: true, access: tokens.access };
}

/** Best-effort: no-op inside Server Components, where cookies are read-only. */
function trySetUserIdCookie(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  userId: string,
) {
  try {
    cookieStore.set("user_id", userId, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
  } catch {
    // read-only cookie store
  }
}

export async function ensureAccessTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("accessToken")?.value;
  const existingUserId = cookieStore.get("user_id")?.value;

  if (existing) {
    let decoded: { exp?: number; user_id?: string | number } | null = null;
    try {
      decoded = jwt_decode<{
        exp?: number;
        user_id?: string | number;
      }>(existing);
    } catch {
      // A malformed access token falls through to refresh.
    }
    if (decoded && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
      if (decoded.user_id != null && !isValidUserId(existingUserId)) {
        trySetUserIdCookie(cookieStore, String(decoded.user_id));
      }
      return existing;
    }
  }

  const result = await refreshCookiesFromRefreshToken();
  return result.ok ? result.access : null;
}

export async function ensureSessionAuth(): Promise<{
  access: string;
  userId: string;
} | null> {
  const access = await ensureAccessTokenCookie();
  if (!access) return null;

  const cookieStore = await cookies();
  let userId = cookieStore.get("user_id")?.value;

  if (!isValidUserId(userId)) {
    try {
      const payload = jwt_decode<{ user_id?: string | number }>(access);
      if (payload.user_id != null) userId = String(payload.user_id);
    } catch {
      return null;
    }
    if (isValidUserId(userId)) trySetUserIdCookie(cookieStore, userId);
  }

  if (!isValidUserId(userId)) return null;
  return { access, userId };
}

const serverApi = api as typeof api & {
  __authRefreshInterceptorInstalled?: boolean;
};

if (!serverApi.__authRefreshInterceptorInstalled) {
  serverApi.__authRefreshInterceptorInstalled = true;
  serverApi.interceptors.response.use(
    (response) => response,
    async (error) => {
      const url: string = error.config?.url ?? "";
      const alreadyRetried: boolean = error.config?._retried ?? false;
      const isRefreshEndpoint =
        url.includes("/token/refresh/") || url.includes("/token/");

      if (
        error.response?.status !== 401 ||
        alreadyRetried ||
        isRefreshEndpoint
      ) {
        return Promise.reject(error);
      }

      error.config._retried = true;
      const result = await refreshCookiesFromRefreshToken();
      if (!result.ok) return Promise.reject(error);

      error.config.headers = {
        ...error.config.headers,
        Authorization: `Bearer ${result.access}`,
      };
      return serverApi.request(error.config);
    },
  );
}

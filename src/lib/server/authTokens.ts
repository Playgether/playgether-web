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

let refreshInFlight: Promise<RefreshCookiesResult> | null = null;

async function doRefreshCookiesFromRefreshToken(): Promise<RefreshCookiesResult> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) return { ok: false };

  try {
    const response = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });
    const { access, refresh: newRefresh } = response.data;
    const decodedAccess = jwt_decode<{
      user_id: string | number;
      exp?: number;
    }>(access);
    if (decodedAccess.user_id == null) return { ok: false };

    cookieStore.set("accessToken", access, {
      ...AUTH_COOKIE_BASE,
      maxAge: accessTokenMaxAgeSec(decodedAccess.exp),
    });
    if (newRefresh) {
      cookieStore.set("refreshToken", newRefresh, {
        ...AUTH_COOKIE_BASE,
        maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
      });
    }
    cookieStore.set("user_id", String(decodedAccess.user_id), {
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

export async function ensureAccessTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("accessToken")?.value;
  const existingUserId = cookieStore.get("user_id")?.value;

  if (existing) {
    try {
      const decoded = jwt_decode<{
        exp?: number;
        user_id?: string | number;
      }>(existing);
      if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
        if (
          decoded.user_id != null &&
          !isValidUserId(existingUserId)
        ) {
          cookieStore.set("user_id", String(decoded.user_id), {
            ...AUTH_COOKIE_BASE,
            maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
          });
        }
        return existing;
      }
    } catch {
      // A malformed access token falls through to refresh.
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
      if (payload.user_id != null) {
        userId = String(payload.user_id);
        cookieStore.set("user_id", userId, {
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

"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";
import {
  AUTH_COOKIE_BASE,
  REFRESH_TOKEN_MAX_AGE_SEC,
  accessTokenMaxAgeSec,
} from "@/lib/authCookies";

export async function loginAction(formData: FormData) {
  const user = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    const cookiesInstance = await cookies();
    const trustedDeviceToken = cookiesInstance.get("trusted_device")?.value;

    const response = await api.post("/api/token/", {
      ...user,
      ...(trustedDeviceToken ? { trusted_device_token: trustedDeviceToken } : {}),
    });

    // 2FA required
    if (response.data.requires_2fa) {
      return { error: "requires_2fa", pending_token: response.data.pending_token as string };
    }

    const decodedAccessToken = jwt_decode<{ user_id: string | number; exp?: number }>(
      response.data.access
    );

    if (decodedAccessToken.user_id == null) {
      return { error: "Erro ao autenticar" };
    }

    cookiesInstance.set("accessToken", response.data.access, {
      ...AUTH_COOKIE_BASE,
      maxAge: accessTokenMaxAgeSec(decodedAccessToken.exp),
    });
    cookiesInstance.set("refreshToken", response.data.refresh, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
    cookiesInstance.set("user_id", String(decodedAccessToken.user_id), {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });

    return { error: null };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return { error: "wrong_password" };
    }
    return { error: error.message || "Erro desconhecido" };
  }
}

export async function completeTwoFALogin(
  pendingToken: string,
  code: string,
  trustDevice: boolean
) {
  try {
    const response = await api.post("/api/auth/2fa/complete/", {
      pending_token: pendingToken,
      code,
      trust_device: trustDevice,
    });

    const { access, refresh } = response.data as { access: string; refresh: string };
    const decoded = jwt_decode<{ user_id: string | number; exp?: number }>(access);

    if (decoded.user_id == null) {
      return { error: "Erro ao autenticar" };
    }

    const cookiesInstance = await cookies();
    cookiesInstance.set("accessToken", access, {
      ...AUTH_COOKIE_BASE,
      maxAge: accessTokenMaxAgeSec(decoded.exp),
    });
    cookiesInstance.set("refreshToken", refresh, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
    cookiesInstance.set("user_id", String(decoded.user_id), {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });

    if (trustDevice) {
      const setCookieHeader = response.headers?.["set-cookie"];
      const cookieArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader ?? ""];
      for (const c of cookieArr) {
        const match = (c as string).match(/trusted_device=([^;]+)/);
        if (match) {
          cookiesInstance.set("trusted_device", match[1], {
            ...AUTH_COOKIE_BASE,
            maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
          });
          break;
        }
      }
    }

    return { error: null };
  } catch (error: any) {
    const detail = error?.response?.data?.detail ?? "Código inválido.";
    return { error: detail };
  }
}

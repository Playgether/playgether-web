"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
};

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

    const accessMaxAge = decodedAccessToken.exp
      ? Math.max(Math.floor(decodedAccessToken.exp - Date.now() / 1000), 1)
      : 3600;

    cookiesInstance.set("accessToken", response.data.access, { ...COOKIE_BASE, maxAge: accessMaxAge });
    cookiesInstance.set("refreshToken", response.data.refresh, { ...COOKIE_BASE, maxAge: 60 * 60 * 24 * 30 });
    cookiesInstance.set("user_id", String(decodedAccessToken.user_id), COOKIE_BASE);

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
    const accessMaxAge = decoded.exp
      ? Math.max(Math.floor(decoded.exp - Date.now() / 1000), 1)
      : 3600;

    const cookiesInstance = await cookies();
    cookiesInstance.set("accessToken", access, { ...COOKIE_BASE, maxAge: accessMaxAge });
    cookiesInstance.set("refreshToken", refresh, { ...COOKIE_BASE, maxAge: 60 * 60 * 24 * 30 });
    cookiesInstance.set("user_id", String(decoded.user_id), COOKIE_BASE);

    if (trustDevice) {
      const setCookieHeader = response.headers?.["set-cookie"];
      const cookieArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader ?? ""];
      for (const c of cookieArr) {
        const match = (c as string).match(/trusted_device=([^;]+)/);
        if (match) {
          cookiesInstance.set("trusted_device", match[1], {
            ...COOKIE_BASE,
            maxAge: 30 * 24 * 60 * 60,
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

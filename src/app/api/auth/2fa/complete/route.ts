import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";
import {
  AUTH_COOKIE_BASE,
  REFRESH_TOKEN_MAX_AGE_SEC,
  accessTokenMaxAgeSec,
} from "@/lib/authCookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward trusted_device cookie to Django so it can validate it
    const trustedCookie = (await cookies()).get("trusted_device")?.value;
    if (trustedCookie && !body.trusted_device_token) {
      body.trusted_device_token = trustedCookie;
    }

    const res = await api.post("/api/auth/2fa/complete/", body);
    const { access, refresh } = res.data as { access: string; refresh: string };

    const decoded = jwt_decode<{ user_id: string | number; exp?: number }>(access);
    if (decoded.user_id == null) {
      return NextResponse.json({ detail: "Erro ao autenticar" }, { status: 500 });
    }

    const nextRes = NextResponse.json({ success: true });
    nextRes.cookies.set("accessToken", access, {
      ...AUTH_COOKIE_BASE,
      maxAge: accessTokenMaxAgeSec(decoded.exp),
    });
    nextRes.cookies.set("refreshToken", refresh, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
    nextRes.cookies.set("user_id", String(decoded.user_id), {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });

    // Forward trusted_device cookie from Django if present
    const setCookieHeader = res.headers?.["set-cookie"];
    if (setCookieHeader) {
      const cookiesArr = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
      for (const c of cookiesArr) {
        if (c.startsWith("trusted_device=")) {
          nextRes.headers.append("set-cookie", c);
        }
      }
    }

    return nextRes;
  } catch (err: any) {
    const status = err.response?.status ?? 500;
    const detail = err.response?.data?.detail ?? "Erro ao completar 2FA";
    return NextResponse.json({ detail }, { status });
  }
}

import { NextRequest, NextResponse } from "next/server";
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
    const response = await api.post("/api/v1/auth/google/", body);

    const { access, refresh } = response.data;
    const decoded = jwt_decode<{ user_id: string | number; exp?: number }>(access);

    if (decoded.user_id == null) {
      return NextResponse.json({ detail: "Erro ao autenticar" }, { status: 500 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("accessToken", access, {
      ...AUTH_COOKIE_BASE,
      maxAge: accessTokenMaxAgeSec(decoded.exp),
    });
    res.cookies.set("refreshToken", refresh, {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });
    res.cookies.set("user_id", String(decoded.user_id), {
      ...AUTH_COOKIE_BASE,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    });

    return res;
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data ?? { detail: "Erro interno." };
    return NextResponse.json(data, { status });
  }
}

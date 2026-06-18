import { NextRequest, NextResponse } from "next/server";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await api.post("/api/v1/auth/google/", body);

    const { access, refresh } = response.data;
    const decoded = jwt_decode<{ user_id: string }>(access);

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    };

    const res = NextResponse.json({ success: true });
    res.cookies.set("accessToken", access, cookieOptions);
    res.cookies.set("refreshToken", refresh, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    res.cookies.set("user_id", String(decoded.user_id), cookieOptions);

    return res;
  } catch (error: any) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data ?? { detail: "Erro interno." };
    return NextResponse.json(data, { status });
  }
}

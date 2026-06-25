"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

// app/actions/authActions.ts
export async function loginAction(formData: FormData) {
  const user = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  try {
    const response = await api.post("/api/token/", user);
    const decodedAccessToken = jwt_decode<{ user_id: string | number; exp?: number }>(
      response.data.access
    );

    const cookiesInstance = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = isProduction
      ? { httpOnly: true, secure: true, sameSite: "lax" as const }
      : { httpOnly: true, secure: false, sameSite: "lax" as const };

    // maxAge alinhado ao exp do JWT — cookie some exatamente quando o token expira
    const accessMaxAge = decodedAccessToken.exp
      ? Math.max(Math.floor(decodedAccessToken.exp - Date.now() / 1000), 1)
      : 3600;

    cookiesInstance.set("accessToken", response.data.access, { ...cookieOptions, maxAge: accessMaxAge });
    cookiesInstance.set("refreshToken", response.data.refresh, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    cookiesInstance.set("user_id", String(decodedAccessToken.user_id), cookieOptions);

    return { error: null };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      return { error: "wrong_password" };
    }
    return { error: error.message || "Erro desconhecido" };
  }
}

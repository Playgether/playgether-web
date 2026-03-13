"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

/**
 * Atualiza o access token usando o refresh token.
 * Chamado silenciosamente em background para manter a sessão ativa.
 * Em caso de falha (ex: refresh expirado), retorna false - o frontend deve fazer logout.
 */
export async function refreshTokenServer(): Promise<boolean> {
  const cookiesInstance = await cookies();
  const refreshToken = cookiesInstance.get("refreshToken")?.value;

  if (!refreshToken) return false;

  try {
    const response = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });

    const { access, refresh: newRefresh } = response.data;
    const decodedAccess = jwt_decode<{ user_id: string | number }>(access);

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = isProduction
      ? {
          httpOnly: true,
          secure: true,
          sameSite: "lax" as const,
        }
      : {
          httpOnly: true,
          secure: false,
          sameSite: "lax" as const,
        };

    cookiesInstance.set("accessToken", access, cookieOptions);
    // Com ROTATE_REFRESH_TOKENS, o backend retorna novo refresh; caso contrário, mantemos o atual
    if (newRefresh) {
      cookiesInstance.set("refreshToken", newRefresh, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 30, // 30 dias
      });
    }
    cookiesInstance.set("user_id", String(decodedAccess.user_id), cookieOptions);

    return true;
  } catch {
    return false;
  }
}

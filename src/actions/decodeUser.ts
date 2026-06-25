"use server";

import { cookies } from "next/headers";
import { UserProps } from "@/context/AuthContext";
import jwt_decode from "jwt-decode";

type JwtPayload = UserProps & { user_id?: string; exp?: number };

export async function decodeUser(): Promise<UserProps | null> {
  const accessToken = (await cookies()).get("accessToken");
  if (!accessToken) return null;

  try {
    const decoded = jwt_decode<JwtPayload>(accessToken.value);

    // Token expirado — trata como ausente para o AuthContext disparar o refresh
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      username: decoded.username,
      first_name: decoded.first_name,
      last_name: decoded.last_name,
      user_id: decoded.user_id || undefined,
    };
  } catch {
    return null;
  }
}

"use server";

import { cookies } from "next/headers";
import { UserProps } from "@/context/AuthContext";
import jwt_decode from "jwt-decode";
import { api } from "@/services/api";

type JwtPayload = { user_id?: string; exp?: number };

export async function decodeUser(): Promise<UserProps | null> {
  const accessToken = (await cookies()).get("accessToken");
  if (!accessToken) return null;

  try {
    const decoded = jwt_decode<JwtPayload>(accessToken.value);

    // Token expirado — trata como ausente para o AuthContext disparar o refresh
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }

    if (!decoded.user_id) return null;
    const { data } = await api.get<{
      id: string;
      username: string;
      first_name: string;
      last_name: string;
    }>("/api/v1/users/me/", {
      headers: { Authorization: `Bearer ${accessToken.value}` },
    });
    return {
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      user_id: data.id,
    };
  } catch {
    return null;
  }
}

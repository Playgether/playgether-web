"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

export async function loginAction(formData: FormData) {
  const user = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const response = await api.post("/api/token/", user);

    // Decodifica o token de acesso para obter as informações do usuário
    const decodedAccessToken = jwt_decode(response.data.access);

    // Salva o token de acesso em um cookie
    (await cookies()).set("accessToken", response.data.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 hora
    });

    // Salva o token de refresh em um cookie
    (await cookies()).set("refreshToken", response.data.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 604800, // 7 dias
    });

    // Salva o user_id em um cookie (extraído do token decodificado)
    (await cookies()).set("user_id", decodedAccessToken.user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600, // 1 hora
    });

    return { error: null };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { error: "wrong_password" };
    }

    return { error: error };
  }
}

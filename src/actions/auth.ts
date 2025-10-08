"use server";

import { cookies } from "next/headers";
import { api } from "@/services/api";
import jwt_decode from "jwt-decode";

// app/actions/authActions.ts
export async function loginAction(formData: FormData) {
  const user = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const response = await api.post("/api/token/", user);
    const decodedAccessToken = jwt_decode(response.data.access);

    const cookiesInstance = await cookies();
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = isProduction
      ? {
          httpOnly: true,
          secure: true,
          sameSite: "lax" as const,
        }
      : {
          httpOnly: true,
          secure: false, // false em dev
          sameSite: "lax" as const,
        };

    cookiesInstance.set("accessToken", response.data.access, cookieOptions);
    cookiesInstance.set("refreshToken", response.data.refresh, {
      ...cookieOptions,
      maxAge: 604800,
    });
    cookiesInstance.set("user_id", decodedAccessToken.user_id, cookieOptions);

    return { error: null };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { error: "wrong_password" };
    }
    return { error: error.message || "Erro desconhecido" };
  }
}

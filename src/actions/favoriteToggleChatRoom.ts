"use server";
import { api } from "@/services/api";
import { cookies } from "next/headers";

export const favoriteToggleChatRoom = async (
  group_id: number,
  http_verb: "POST" | "DELETE"
) => {
  const accessToken = (await cookies()).get("accessToken")?.value;

  if (!accessToken) {
    console.log("Token de acesso não encontrado");
    return;
  }

  if (!["POST", "DELETE"].includes(http_verb)) {
    console.error("Método HTTP inválido:", http_verb);
    return;
  }

  try {
    const response = await api.request({
      url: `/api/v1/chatrooms/${group_id}/favorite/`,
      method: http_verb, // Dinâmico: "POST" ou "DELETE"
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return true;
  } catch (error) {
    console.error("Erro ao favoritar/desfavoritar:", error);
    return error;
  }
};

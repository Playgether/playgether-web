import { cookies } from "next/headers";
import { api } from "./api";

export const validateRoomService = async (roomSlug: string) => {
    const accessToken = (await cookies()).get("accessToken")?.value;
    const segment = encodeURIComponent(String(roomSlug).trim());
  
    try {
      const response = await api.get(
        `/api/v1/chatrooms/${segment}/validate/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      return {
        ok: true,
        response, 
      };
    } catch (error: any) {
      console.error("Erro ao validar sala:", error);
  
      return {
        ok: false,
        error: error.response || error.message, 
      };
    }
  };
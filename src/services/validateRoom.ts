import { cookies } from "next/headers";
import { api } from "./api";

export const validadeRoom = async (roomName: string) => {
    const accessToken = (await cookies()).get("accessToken")?.value;
  
    try {
      const response = await api.get(`/api/v1/chatrooms/${roomName}/validate`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      return {
        ok: true,
        response, // o response real do axios
      };
    } catch (error: any) {
      console.error("Erro ao validar sala:", error);
  
      return {
        ok: false,
        error: error.response || error.message, // você pode adaptar isso como quiser
      };
    }
  };
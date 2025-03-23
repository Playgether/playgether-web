import { cookies } from "next/headers";
import { api } from "./api";

export const getRoomMessages = async (group_name: string) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    if (!accessToken) {
      console.log("Token de acesso não encontrado");
      return;
    }
    const response = await api.get(
      `/api/v1/room/messages/?group=${group_name}`,
      {
        headers: {
          Authorization: "Bearer " + String(accessToken),
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

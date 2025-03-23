import { cookies } from "next/headers";
import { api } from "./api";

export const getChatRooms = async () => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const response = await api.get(`/api/v1/chatrooms/`, {
      headers: {
        Authorization: "Bearer " + String(accessToken),
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

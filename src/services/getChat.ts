import { cookies } from "next/headers";
import { api } from "./api";

export const getChat = async ({ id }: { id: number }) => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  try {
    const response = await api.get(`/api/v1/chatroom/${id}/`, {
      headers: {
        Authorization: "Bearer " + String(accessToken?.access),
      },
    });
    return response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

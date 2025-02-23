"use server";

import { api } from "@/services/api";
import { getNotificationsProps } from "@/types/getNotificationsProps";
import { cookies } from "next/headers";

export const getNotifications = async () => {
  const accessToken = (await cookies()).get("accessToken")?.value;
  const userId = (await cookies()).get("user_id")?.value;
  const response = await api
    .get<getNotificationsProps>(`/api/v1/users/${userId}/notifications/`, {
      headers: {
        Authorization: "Bearer " + String(accessToken),
      },
    })
    .catch((error) => {
      console.log(error);
      return error;
    });
  return response.data;
};

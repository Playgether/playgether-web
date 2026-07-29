import { api } from "@/services/api";
import { getNotificationsProps } from "@/types/getNotificationsProps";
import { ensureSessionAuth } from "@/actions/refreshToken";

export const getNotifications = async () => {
  const session = await ensureSessionAuth();
  if (!session) return [];

  try {
    const response = await api.get<getNotificationsProps>(
      `/api/v1/users/${session.userId}/notifications/`,
      {
        headers: {
          Authorization: `Bearer ${session.access}`,
        },
      },
    );
    return response.data ?? [];
  } catch (error) {
    console.log(error);
    return [];
  }
};

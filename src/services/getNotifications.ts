import { api } from "@/services/api";
import type { NotificationProps } from "@/app/feed/types/NotificationProps";
import { ensureSessionAuth } from "@/actions/refreshToken";

export const getNotifications = async () => {
  const session = await ensureSessionAuth();
  if (!session) return [];

  try {
    const response = await api.get<NotificationProps[]>(
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

"use client";

import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useAuthContext } from "./AuthContext";
import { apiFetch } from "@/services/apiFetch";
import { useNotifications } from "@/app/feed/hooks/useNotificationsWebSocket";
import { CustomToast } from "@/components/ui/customSonner";
import {
  emitDuoInviteChanged,
  emitDuoOpenChat,
} from "@/lib/duoInviteEvents";
import type { NotificationProps } from "@/app/feed/types/NotificationProps";

export interface NotificationItem {
  id: number;
  is_read: boolean;
  message: string;
  timestamp: string;
  notification_type: string;
  object_id: number;
  content_type: number;
  action_url?: string | null;
  actors: {
    name: string;
    username: string;
    profile_photo: string | null;
    user_id?: number | string;
  }[];
}

type NotificationsContextProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  refetch: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAll: () => Promise<void>;
};

const NotificationContext = createContext<NotificationsContextProps>(
  {} as NotificationsContextProps,
);

const DUO_DEFAULT_URL = "/duo?step=results&tab=requests";

const NotificationsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async (options?: { silent?: boolean }) => {
    if (!user?.user_id) return;
    if (!options?.silent) setLoading(true);
    try {
      const res = await apiFetch("/api/notifications", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      // silent
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (user?.user_id) void refetch();
  }, [user?.user_id, refetch]);

  const refetchSilent = useCallback(() => {
    void refetch({ silent: true });
  }, [refetch]);

  const handleLiveNotification = useCallback(
    (notification: NotificationProps) => {
      refetchSilent();
      if (notification.notification_type !== "app" || notification.actors.length === 0) {
        return;
      }
      const msg = notification.message || "";
      const duoUrl = notification.action_url || DUO_DEFAULT_URL;
      const actor = notification.actors[0];

      if (msg.includes("te chamou para jogar")) {
        emitDuoInviteChanged();
        CustomToast.info(msg, {
          description: "Responda na aba Solicitações do Duo Finder.",
          link: { label: "Abrir Duo", href: duoUrl },
        });
        return;
      }
      if (msg.includes("aceitou seu convite de duo")) {
        emitDuoInviteChanged();
        CustomToast.success(msg, {
          description: "O chat foi liberado — combinem a partida.",
          link: { label: "Abrir Duo", href: duoUrl },
          action: actor?.user_id
            ? {
                label: "Enviar mensagem",
                onClick: () =>
                  emitDuoOpenChat({
                    partnerUserId: actor.user_id!,
                    partnerUsername: actor.username,
                    partnerName: actor.name,
                    partnerAvatar: actor.profile_photo,
                  }),
              }
            : undefined,
        });
      }
    },
    [refetchSilent],
  );

  useNotifications({
    onNewNotification: handleLiveNotification,
    onNotificationRemoved: refetchSilent,
  });

  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      await apiFetch(`/api/notifications/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {
      void refetch();
    }
  }, [refetch]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await apiFetch("/api/notifications", {
        method: "PATCH",
        credentials: "include",
      });
    } catch {
      void refetch();
    }
  }, [refetch]);

  const deleteNotification = useCallback(async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiFetch(`/api/notifications/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      void refetch();
    }
  }, [refetch]);

  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      await apiFetch("/api/notifications", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      void refetch();
    }
  }, [refetch]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refetch,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

const useNotificationContext = () => useContext(NotificationContext);

export { NotificationsContextProvider, useNotificationContext, NotificationContext };

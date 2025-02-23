"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import { useProfileContext } from "./ProfileContext";
import { getNotificationsProps } from "@/types/getNotificationsProps";
import { getNotifications } from "@/actions/getNotifications";

type NotificationsContextProps = {
  notifications: getNotificationsProps[] | undefined;
};

const NotificationContext = createContext<NotificationsContextProps>(
  {} as NotificationsContextProps
);

const NotificationsContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<getNotificationsProps[]>();
  const { profile } = useProfileContext();

  async function fetchNotifications() {
    try {
      const response = await getNotifications();
      setNotifications(response);
      console.log(notifications);
    } catch (err) {
      console.error("Erro ao buscar conteúdo", err);
    }
  }

  useEffect(() => {
    if (!notifications && user && profile?.id) {
      fetchNotifications();
    }
  }, [profile]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  return context;
};

export {
  NotificationsContextProvider,
  useNotificationContext,
  NotificationContext,
};

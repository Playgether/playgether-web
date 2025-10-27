"use client";

import { useSecureWebSocket } from "@/hooks/useSecureWebSocket";
import { useState, useCallback } from "react";
import { NotificationProps } from "../types/NotificationProps";

interface UseNotificationsOptions {
  onNewNotification?: (notification: NotificationProps) => void;
  onNotificationRemoved?: (notification: NotificationProps) => void;
  notificationsList?: NotificationProps[];
}

export const useNotifications = (options?: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>(
    options?.notificationsList ?? []
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const handleMessage = useCallback(
    (message: any) => {
      if (
        message &&
        typeof message === "object" &&
        "message" in message &&
        "actors" in message &&
        "timestamp" in message &&
        "object_id" in message &&
        "content_type" in message &&
        "notification_type" in message
      ) {
        const newNotification: NotificationProps = {
          object_id: message.object_id as number,
          message: message.message as string,
          actors: Array.isArray(message.actors) ? message.actors : [],
          timestamp: new Date(message.timestamp),
          content_type: message.content_type as number,
          notification_type: message.notification_type as string,
          id: message.id as string,
        };

        setNotifications((prevNotifications) => {
          // Caso actors seja 0, remover a notificação
          if (newNotification.actors.length === 0) {
            const removedNotification = prevNotifications.find(
              (notification) =>
                notification.object_id === newNotification.object_id &&
                notification.content_type === newNotification.content_type &&
                notification.notification_type ===
                  newNotification.notification_type
            );

            if (removedNotification) {
              options?.onNotificationRemoved?.(removedNotification);
            }

            return prevNotifications.filter(
              (notification) =>
                !(
                  notification.object_id === newNotification.object_id &&
                  notification.content_type === newNotification.content_type &&
                  notification.notification_type ===
                    newNotification.notification_type
                )
            );
          }

          // Verifica se a notificação já existe
          const existingIndex = prevNotifications.findIndex(
            (notification) =>
              notification.object_id === newNotification.object_id &&
              notification.content_type === newNotification.content_type &&
              notification.notification_type ===
                newNotification.notification_type
          );

          let updatedNotifications;

          if (existingIndex !== -1) {
            // Atualiza a notificação existente
            updatedNotifications = [...prevNotifications];
            updatedNotifications[existingIndex] = newNotification;
          } else {
            // Adiciona a nova notificação
            updatedNotifications = [newNotification, ...prevNotifications];
            setUnreadCount((prev) => prev + 1);
            options?.onNewNotification?.(newNotification);
          }

          // Ordena por timestamp (do mais recente para o mais antigo)
          updatedNotifications.sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          });

          return updatedNotifications;
        });
      }
    },
    [options]
  );

  const { connectionStatus, isConnected, connectionError, reconnect } =
    useSecureWebSocket({
      url: "/ws/notifications/",
      shouldReconnect: () => true,
      onMessage: handleMessage,
    });

  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      // Marcar notificação específica como lida
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } else {
      // Marcar todas como lidas
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    connectionStatus,
    isConnected,
    connectionError,
    reconnect,
    markAsRead,
  };
};

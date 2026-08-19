"use client";

import { useSecureWebSocket } from "@/hooks/useSecureWebSocket";
import { useState, useCallback, useRef } from "react";
import { NotificationProps } from "../types/NotificationProps";

interface UseNotificationsOptions {
  onNewNotification?: (notification: NotificationProps) => void;
  onNotificationRemoved?: (notification: NotificationProps) => void;
  notificationsList?: NotificationProps[];
}

function isSameNotification(a: NotificationProps, b: NotificationProps) {
  return (
    a.object_id === b.object_id &&
    a.content_type === b.content_type &&
    a.notification_type === b.notification_type
  );
}

function sortByTimestamp(list: NotificationProps[]) {
  return list.toSorted(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export const useNotifications = (options?: UseNotificationsOptions) => {
  const [notifications, setNotifications] = useState<NotificationProps[]>(
    options?.notificationsList ?? [],
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const onNewNotificationRef = useRef(options?.onNewNotification);
  onNewNotificationRef.current = options?.onNewNotification;

  const onNotificationRemovedRef = useRef(options?.onNotificationRemoved);
  onNotificationRemovedRef.current = options?.onNotificationRemoved;

  const handleMessage = useCallback((message: any) => {
    if (
      !message ||
      typeof message !== "object" ||
      !("message" in message) ||
      !("actors" in message) ||
      !("timestamp" in message) ||
      !("object_id" in message) ||
      !("content_type" in message) ||
      !("notification_type" in message)
    ) {
      return;
    }

    const incoming: NotificationProps = {
      object_id: message.object_id as number,
      message: message.message as string,
      actors: Array.isArray(message.actors) ? message.actors : [],
      timestamp: new Date(message.timestamp),
      content_type: message.content_type as number,
      notification_type: message.notification_type as string,
      action_url: (message.action_url as string | null | undefined) ?? null,
      id: message.id as string,
      read: message.is_read === true ? true : message.is_read === false ? false : undefined,
    };

    const prev = notificationsRef.current;

    if (incoming.actors.length === 0) {
      const removed = prev.find((notification) =>
        isSameNotification(notification, incoming),
      );
      const next = prev.filter(
        (notification) => !isSameNotification(notification, incoming),
      );
      notificationsRef.current = next;
      setNotifications(next);
      if (removed) onNotificationRemovedRef.current?.(removed);
      return;
    }

    const existingIndex = prev.findIndex((notification) =>
      isSameNotification(notification, incoming),
    );
    const isNew = existingIndex === -1;
    const next = isNew
      ? [incoming, ...prev]
      : prev.map((notification, index) =>
          index === existingIndex ? incoming : notification,
        );
    const sorted = sortByTimestamp(next);
    notificationsRef.current = sorted;
    setNotifications(sorted);

    if (isNew) {
      setUnreadCount((count) => count + 1);
    }
    onNewNotificationRef.current?.(incoming);
  }, []);

  const { connectionStatus, isConnected, connectionError, reconnect } =
    useSecureWebSocket({
      url: "/ws/notifications/",
      shouldReconnect: () => true,
      onMessage: handleMessage,
    });

  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } else {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
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

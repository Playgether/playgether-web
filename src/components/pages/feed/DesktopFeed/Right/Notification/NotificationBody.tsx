"use client";
import React, { useEffect, useState } from "react";
import NotificationsStructure from "./NotificationsStructure";
import NotificationDate from "./NotificationDate";
import NotificationText from "./NotificationText";
import { NotificationWrapper } from "./NotificationWrapper";
import EmptyData from "@/components/elements/EmptyDataComponent/EmptyData";
import useWebSocket from "react-use-websocket";

function NotificationBody({ notificationsParent, user_id, token }) {
  const [notifications, setNotifications] = useState(notificationsParent);
  const { lastJsonMessage } = useWebSocket(
    `ws://192.168.18.8:8000/ws/notifications/?token=${token}`,
    {
      share: false,
      shouldReconnect: () => true,
    }
  );
  useEffect(() => {
    if (
      lastJsonMessage &&
      typeof lastJsonMessage === "object" &&
      "message" in lastJsonMessage &&
      "actors" in lastJsonMessage &&
      "timestamp" in lastJsonMessage &&
      "object_id" in lastJsonMessage &&
      "content_type" in lastJsonMessage &&
      "notification_type" in lastJsonMessage
    ) {
      const message = {
        object_id: lastJsonMessage.object_id, // Adicionando para facilitar a comparação
        message: lastJsonMessage.message,
        actors: lastJsonMessage.actors,
        timestamp: lastJsonMessage.timestamp,
        content_type: lastJsonMessage.content_type,
        notification_type: lastJsonMessage.notification_type,
      };

      setNotifications((prevNotifications) => {
        const exists = prevNotifications.some(
          (notification) => notification.object_id === message.object_id && notification.content_type === message.content_type && notification.notification_type === message.notification_type
        );

        if (exists) {
          // Substitui a notificação existente e move para o topo
          return [
            message,
            ...prevNotifications.filter(
              (notification) => notification.object_id !== message.object_id
            ),
          ];
        }

        // Adiciona a nova notificação no topo
        return [message, ...prevNotifications];
      });
    }
  }, [lastJsonMessage]);
  return (
    <>
      {notifications && notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <NotificationWrapper key={index}>
            <NotificationsStructure actors={notification.actors}>
              <NotificationDate timestamp={notification.timestamp} />
            </NotificationsStructure>
            <NotificationText text={notification.message} />
          </NotificationWrapper>
        ))
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <EmptyData text="Nenhuma notificação encontrada" />
        </div>
      )}
    </>
  );
}

export default NotificationBody;

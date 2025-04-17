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
      const newNotification: {
        object_id: number;
        message: string;
        actors: any[]; 
        timestamp: Date;
        content_type: number;
        notification_type: string;
      } = {
        object_id: lastJsonMessage.object_id as number,
        message: lastJsonMessage.message as string,
        actors: Array.isArray(lastJsonMessage.actors) ? lastJsonMessage.actors : [],
        timestamp: lastJsonMessage.timestamp as Date,
        content_type: lastJsonMessage.content_type as number,
        notification_type: lastJsonMessage.notification_type as string,
      };
      setNotifications((prevNotifications) => {
        // Caso actors seja 0, remover a notificação
        if (newNotification.actors.length === 0) {
          return prevNotifications.filter(
            (notification) => 
              !(notification.object_id === newNotification.object_id &&
              notification.content_type === newNotification.content_type &&
              notification.notification_type === newNotification.notification_type)
          );
        }

        // Verifica se a notificação já existe
        const existingIndex = prevNotifications.findIndex(
          (notification) => 
            notification.object_id === newNotification.object_id &&
            notification.content_type === newNotification.content_type &&
            notification.notification_type === newNotification.notification_type
        );

        let updatedNotifications;
        
        if (existingIndex !== -1) {
          // Atualiza a notificação existente
          updatedNotifications = [...prevNotifications];
          updatedNotifications[existingIndex] = newNotification;
        } else {
          // Adiciona a nova notificação
          updatedNotifications = [newNotification, ...prevNotifications];
        }

        // Ordena por timestamp (do mais recente para o mais antigo)
        updatedNotifications.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB.getTime() - dateA.getTime();
        });

        return updatedNotifications;
      });
    }
  }, [lastJsonMessage]);

  return (
    <>
      {notifications && notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <NotificationWrapper key={`${notification.object_id}-${notification.content_type}-${notification.notification_type}-${index}`}>
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
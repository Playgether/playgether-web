// components/NotificationTest.tsx
"use client";

import { useNotifications } from "../feed/hooks/useNotificationsWebSocket";

const NotificationTest = () => {
  const {
    notifications,
    unreadCount,
    connectionStatus,
    isConnected,
    connectionError,
    reconnect,
  } = useNotifications({
    onNewNotification: (notification) => {
      console.log("Nova notificação:", notification);
    },
    onNotificationRemoved: (notification) => {
      console.log("Notificação removida:", notification);
    },
  });

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Notificações</h2>

      <div className="mb-4">
        <p>Status: {connectionStatus}</p>
        <p>Conectado: {isConnected ? "Sim" : "Não"}</p>
        <p>Não lidas: {unreadCount}</p>
        {connectionError && (
          <p className="text-red-500">Erro: {connectionError}</p>
        )}
        {!isConnected && (
          <button
            onClick={reconnect}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reconectar
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((notification, index) => (
          <div key={index} className="p-3 border rounded">
            <p className="font-semibold">{notification.message}</p>
            <p className="text-sm text-gray-600">
              {new Date(notification.timestamp).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Tipo: {notification.notification_type}
            </p>
          </div>
        ))}

        {notifications.length === 0 && (
          <p className="text-gray-500">Nenhuma notificação</p>
        )}
      </div>
    </div>
  );
};

export default NotificationTest;

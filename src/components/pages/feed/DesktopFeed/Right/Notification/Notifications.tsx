import { useNotificationContext } from "../../../../../../context/NotificationsContext";
import { NotificationWrapper } from "./NotificationWrapper";

/** Este é o wrapper principal do card de Notificações em "Right" na página de feed. */
const Notifications = () => {
  const { notifications } = useNotificationContext();

  return (
    <div className="flex flex-col w-full pl-2 flex-wrap flex-1 2xl:space-y-4 mb-4 p-6 pt-0">
      {notifications &&
        notifications.map((notification) => (
          <NotificationWrapper
            key={notification.id}
            profile_photo={notification.actor_profile_photo}
            title={notification.actor_name}
            text={notification.message}
            timestamp={notification.timestamp}
          />
        ))}
    </div>
  );
};

export default Notifications;

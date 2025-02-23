import { getNotifications } from "@/actions/getNotifications";
import { NotificationWrapper } from "./NotificationWrapper";
import NotificationsStructure from "./NotificationsStructure";
import NotificationDate from "./NotificationDate";
import NotificationText from "./NotificationText";
import EmptyData from "@/components/elements/EmptyDataComponent/EmptyData";

/** Este é o wrapper principal do card de Notificações em "Right" na página de feed. */
const Notifications = async () => {
  const notifications = await getNotifications();
  return (
    <div className="flex flex-col w-full pl-2 flex-wrap flex-1 2xl:space-y-4 mb-4 p-6 pt-0">
      {notifications && notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <NotificationWrapper key={index}>
            <NotificationsStructure
              title={notification.actor_name}
              profile_photo={notification.profile_photo}
            >
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
    </div>
  );
};

export default Notifications;

import { getNotifications } from "@/actions/getNotifications";
import NotificationBody from "./NotificationBody";
import { cookies } from "next/headers";

/** Este é o wrapper principal do card de Notificações em "Right" na página de feed. */
const Notifications = async () => {
  const notifications = await getNotifications();
  const accessToken = (await cookies()).get("accessToken")?.value;
  const user_id = (await cookies()).get("user_id")?.value;
  return (
    <div className="flex flex-col w-full pl-2 flex-wrap flex-1 2xl:space-y-4 mb-4 p-6 pt-0">
      <NotificationBody
        notificationsParent={notifications}
        user_id={user_id}
        token={accessToken}
      />
    </div>
  );
};

export default Notifications;

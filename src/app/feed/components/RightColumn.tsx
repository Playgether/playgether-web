import React from "react";
import { NotificationsCard } from "./NotificationsCard";
import { TrendingTopics } from "./TrendingTopics";
import { getNotifications } from "@/services/getNotifications";

export default async function RightColumn() {
  const notifications = await getNotifications();
  return (
    <div className="sticky-container col-span-3 hidden min-w-0 space-y-6 lg:block">
      <NotificationsCard notificationsList={notifications} />
      <div className="sticky top-24">
        <TrendingTopics />
      </div>
    </div>
  );
}

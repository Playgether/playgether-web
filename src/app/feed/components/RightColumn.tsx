import React from "react";
import { NotificationsCard } from "./NotificationsCard";
import { TrendingTopics } from "./TrendingTopics";
import { getNotifications } from "@/services/getNotifications";

export default async function RightColumn() {
  const notifications = await getNotifications();
  return (
    <div className="col-span-3 space-y-6 sticky-container">
      <NotificationsCard notificationsList={notifications} />
      <div className="sticky top-24">
        <TrendingTopics />
      </div>
    </div>
  );
}

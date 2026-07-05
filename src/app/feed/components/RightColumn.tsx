import React from "react";
import { NotificationsCard } from "./NotificationsCard";
import { ActiveRoomsCard } from "./ActiveRoomsCard";
import { FollowSuggestionsCard } from "./FollowSuggestionsCard";
import { getNotifications } from "@/services/getNotifications";

export default async function RightColumn() {
  const notifications = await getNotifications();
  return (
    <div className="sticky-container col-span-3 hidden min-w-0 space-y-6 lg:block">
      <NotificationsCard notificationsList={notifications} />
      <div className="sticky top-24 space-y-6">
        <FollowSuggestionsCard />
        <ActiveRoomsCard />
      </div>
    </div>
  );
}

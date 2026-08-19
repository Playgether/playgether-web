import React from "react";
import { NotificationsCard } from "./NotificationsCard";
import { ActiveRoomsCard } from "./ActiveRoomsCard";
import { FollowSuggestionsCard } from "./FollowSuggestionsCard";

export default async function RightColumn() {
  return (
    <div className="col-span-3 hidden min-w-0 space-y-6 lg:block">
      <NotificationsCard />
      <div className="sticky top-24 space-y-6">
        <FollowSuggestionsCard />
        <ActiveRoomsCard />
      </div>
    </div>
  );
}

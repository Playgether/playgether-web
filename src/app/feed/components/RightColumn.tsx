import React from "react";
import { NotificationsCard } from "./NotificationsCard";
import { TrendingTopics } from "./TrendingTopics";

export default function RightColumn() {
  return (
    <div className="col-span-3 space-y-6 sticky-container">
      <NotificationsCard />
      <div className="sticky top-24">
        <TrendingTopics />
      </div>
    </div>
  );
}

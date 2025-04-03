"use client";
import React from "react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";

function NotificationDate({ timestamp }: { timestamp: Date }) {
  return (
    <div className="NotificationWrapper-date text-sm pt-1">
      <DateAndHour date={timestamp} />
    </div>
  );
}

export default NotificationDate;

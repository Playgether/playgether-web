"use client";
import React from "react";
import brazilianStrings from "react-timeago/lib/language-strings/pt-br";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import TimeAgo from "react-timeago";

function NotificationDate({ timestamp }: { timestamp: number | Date }) {
  const formatter = buildFormatter(brazilianStrings);
  return (
    <div className="NotificationWrapper-date text-sm pt-1">
      <TimeAgo date={timestamp} formatter={formatter} />
    </div>
  );
}

export default NotificationDate;

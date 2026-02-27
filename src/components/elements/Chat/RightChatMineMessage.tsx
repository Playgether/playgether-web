"use client";
import React from "react";
import DateAndHour from "@/components/layouts/DateAndHour/DateAndHour";

function RightChatMineMessage({
  message,
  hour,
}: {
  message: string;
  hour: string | Date;
}) {
  return (
    <div className="flex flex-row-reverse items-end mb-4" data-mine="true">
      <div className="max-w-xs  w-fit flex flex-col items-end">
        <div className="RightChatMineMessage-wrapper whitespace-pre-wrap p-3 rounded-2xl rounded-br-none w-fit">
          <p>{message}</p>
        </div>
        <p className="text-xs RightChatMineMessage-hours mt-1 text-right">
          {typeof hour === "string" ? hour : <DateAndHour date={hour} />}
        </p>
      </div>
    </div>
  );
}

export default RightChatMineMessage;

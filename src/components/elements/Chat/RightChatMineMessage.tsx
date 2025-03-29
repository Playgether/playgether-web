"use client";
import React from "react";
import brazilianStrings from "react-timeago/lib/language-strings/pt-br";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import TimeAgo from "react-timeago";

function RightChatMineMessage({
  message,
  hour,
}: {
  message: string;
  hour: Date;
}) {
  const formatter = buildFormatter(brazilianStrings);
  return (
    <div className="flex flex-row-reverse items-end mb-4" data-mine="true">
      <div className="max-w-xs  w-fit flex flex-col items-end">
        <div className="RightChatMineMessage-wrapper whitespace-pre-wrap p-3 rounded-2xl rounded-br-none w-fit">
          <p>{message}</p>
        </div>
        <p className="text-xs RightChatMineMessage-hours mt-1 text-right">
          <TimeAgo date={hour} formatter={formatter} />
        </p>
      </div>
    </div>
  );
}

export default RightChatMineMessage;

import React from "react";
import brazilianStrings from "react-timeago/lib/language-strings/pt-br";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import TimeAgo from "react-timeago";

function DateAndHour({ date }: { date: Date }) {
  const formatter = buildFormatter(brazilianStrings);
  return <TimeAgo date={date} formatter={formatter} />;
}

export default DateAndHour;

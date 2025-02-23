import TextLimitComponent from "@/components/layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";
import React from "react";

function NotificationText({ text }: { text: string }) {
  return (
    <div className="NotificationWrapper-text text-xs pt-2 pb-5 font-medium">
      <TextLimitComponent text={text} maxCharacters={100} />
    </div>
  );
}

export default NotificationText;

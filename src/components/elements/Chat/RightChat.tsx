import React from "react";
import RightChatTop from "./RightChatTop";
import RightChatMessages from "./RightChatMessages";
import RightChatInputWrapper from "./RightChatInputWrapper";

function RightChat() {
  return (
    <div className="flex-1 flex flex-col RightChat-wrapper min-h-0">
      <RightChatTop />
      <RightChatMessages />
      <RightChatInputWrapper />
    </div>
  );
}

export default RightChat;

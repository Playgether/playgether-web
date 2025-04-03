import React from "react";
import RightChatRoomMessages from "./RightChatRoomMessages";
import RightChatInputWrapper from "../../RightChatInputWrapper";

function RightChatWrapper({ messages }) {
  return (
    <>
      <RightChatRoomMessages messages={messages} />
      <RightChatInputWrapper />
    </>
  );
}

export default RightChatWrapper;

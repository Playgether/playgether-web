import React from "react";
import LeftChat from "./LeftChat";
import RightChat from "./RightChat";

const Chat = () => {
  return (
    <div className="flex h-full max-h-[calc(100vh-160px)] w-full text-white mt-2">
      <LeftChat />
      <RightChat />
    </div>
  );
};

export default Chat;

import React from "react";

function RightChatRoomOnline({ quantity }: { quantity: string }) {
  return (
    <div className="RightChatRoomOnline-wrapper sticky top-0 gap-2 w-full items-center p-2 justify-center text-center font-semibold flex">
      <div className="rounded-full ChatConversations-online w-3 h-3"></div>
      <span>{quantity}</span>
    </div>
  );
}

export default RightChatRoomOnline;

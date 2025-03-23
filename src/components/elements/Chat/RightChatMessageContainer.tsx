import React from "react";

function RightChatMessageContainer({
  image,
  message,
  hour,
}: {
  image: string;
  message: string;
  hour: string;
}) {
  return (
    <div className="flex items-end">
      <img src={image} alt="Scarlett" className="h-8 w-8 rounded-full mr-2" />
      <div className="max-w-xs">
        <div className="RightChatMessageContainer-wrapper p-3 rounded-2xl rounded-bl-none">
          <p>{message}</p>
        </div>
        <p className="text-xs RightChatMessageContainer-hours mt-1">{hour}</p>
      </div>
    </div>
  );
}

export default RightChatMessageContainer;

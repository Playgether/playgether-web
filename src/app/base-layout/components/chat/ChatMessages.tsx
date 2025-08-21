import React from "react";
import { MessageInterface } from "../../types/chat/MessageInterface";

export default function ChatMessages({
  messages,
}: {
  messages: MessageInterface[];
}) {
  return (
    <div
      className="space-y-4"
      role="log"
      aria-live="polite"
      aria-atomic="false"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              message.isOwn ? "bg-gradient-primary text-white" : "bg-muted"
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <span className="text-xs opacity-70 mt-1 block">
              {message.timestamp}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

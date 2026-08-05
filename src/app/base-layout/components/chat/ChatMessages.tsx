"use client";

import React, { useState } from "react";
import { MessageInterface } from "../../types/chat/MessageInterface";
import { SharedCutCard } from "./SharedCutCard";
import { SharedCutModal } from "./SharedCutModal";

export default function ChatMessages({
  messages,
}: {
  messages: MessageInterface[];
}) {
  const [openCutId, setOpenCutId] = useState<number | null>(null);

  return (
    <>
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
            {message.sharedContent ? (
              <div className="max-w-[70%]">
                <SharedCutCard
                  content={message.sharedContent}
                  onClick={() => setOpenCutId(message.sharedContent!.id)}
                />
                <span className="mt-1 block text-xs opacity-70">
                  {message.timestamp}
                </span>
              </div>
            ) : (
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
            )}
          </div>
        ))}
      </div>

      <SharedCutModal cutId={openCutId} onOpenChange={(open) => !open && setOpenCutId(null)} />
    </>
  );
}

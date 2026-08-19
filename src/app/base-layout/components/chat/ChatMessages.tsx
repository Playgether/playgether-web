"use client";

import React, { useState } from "react";
import { Megaphone } from "lucide-react";
import { MessageInterface } from "../../types/chat/MessageInterface";
import { SharedCutCard } from "./SharedCutCard";
import { SharedCutModal } from "./SharedCutModal";
import { cn } from "@/lib/utils";

const MEGAPHONE_REPLY_RE =
  /^Respondendo ao alto-falante de @([^\s:]+):\s*[\n\r]*[“"]([\s\S]*?)[”"]\s*([\s\S]*)$/;

type ParsedMegaphoneReply = {
  authorUsername: string;
  quote: string;
  reply: string;
};

function parseMegaphoneReply(content: string): ParsedMegaphoneReply | null {
  const trimmed = content.trim();
  const match = trimmed.match(MEGAPHONE_REPLY_RE);
  if (!match) return null;
  const reply = (match[3] ?? "").trim();
  return {
    authorUsername: match[1],
    quote: (match[2] ?? "").trim(),
    reply,
  };
}

function MegaphoneReplyBubble({
  parsed,
  isOwn,
  timestamp,
}: {
  parsed: ParsedMegaphoneReply;
  isOwn: boolean;
  timestamp: string;
}) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-md border-l-2 px-2.5 py-1.5",
          isOwn
            ? "border-white/50 bg-white/15"
            : "border-primary/50 bg-background/60"
        )}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <Megaphone
            className={cn(
              "h-3 w-3 shrink-0",
              isOwn ? "text-white/90" : "text-primary"
            )}
          />
          <span
            className={cn(
              "truncate text-[11px] font-medium",
              isOwn ? "text-white/90" : "text-foreground"
            )}
          >
            Alto-falante de @{parsed.authorUsername}
          </span>
        </div>
        <p
          className={cn(
            "text-xs leading-relaxed",
            isOwn ? "text-white/75" : "text-muted-foreground"
          )}
        >
          “{parsed.quote}”
        </p>
      </div>

      {parsed.reply ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {parsed.reply}
        </p>
      ) : null}

      <span className="mt-1 block text-xs opacity-70">{timestamp}</span>
    </div>
  );
}

export default function ChatMessages({
  messages,
}: {
  messages: MessageInterface[];
}) {
  const [openCutId, setOpenCutId] = useState<string | null>(null);

  return (
    <>
      <div
        className="space-y-4"
        role="log"
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.map((message) => {
          const megaphoneReply = message.sharedContent
            ? null
            : parseMegaphoneReply(message.content);

          return (
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
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.isOwn ? "bg-gradient-primary text-white" : "bg-muted"
                  }`}
                >
                  {megaphoneReply ? (
                    <MegaphoneReplyBubble
                      parsed={megaphoneReply}
                      isOwn={message.isOwn}
                      timestamp={message.timestamp}
                    />
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      <span className="mt-1 block text-xs opacity-70">
                        {message.timestamp}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SharedCutModal cutId={openCutId} onOpenChange={(open) => !open && setOpenCutId(null)} />
    </>
  );
}

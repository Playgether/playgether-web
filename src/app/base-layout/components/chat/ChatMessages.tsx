"use client";

import React, { useState } from "react";
import { Check, CheckCheck, Megaphone, Swords } from "lucide-react";
import { MessageInterface } from "../../types/chat/MessageInterface";
import { SharedCutCard } from "./SharedCutCard";
import { SharedCutModal } from "./SharedCutModal";
import { cn } from "@/lib/utils";
import { parseDuoFinderMessage } from "@/lib/duoFinderMessage";

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
}: {
  parsed: ParsedMegaphoneReply;
  isOwn: boolean;
}) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          "rounded-md border-l-2 px-2.5 py-1.5",
          isOwn
            ? "border-white/50 bg-white/15"
            : "border-primary/50 bg-background/60",
        )}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <Megaphone
            className={cn(
              "h-3 w-3 shrink-0",
              isOwn ? "text-white/90" : "text-primary",
            )}
          />
          <span
            className={cn(
              "truncate text-[11px] font-medium",
              isOwn ? "text-white/90" : "text-foreground",
            )}
          >
            Alto-falante de @{parsed.authorUsername}
          </span>
        </div>
        <p
          className={cn(
            "text-xs leading-relaxed",
            isOwn ? "text-white/75" : "text-muted-foreground",
          )}
        >
          “{parsed.quote}”
        </p>
      </div>

      {parsed.reply ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {parsed.reply}
        </p>
      ) : null}
    </div>
  );
}

function DuoFinderReplyBubble({
  parsed,
  isOwn,
}: {
  parsed: NonNullable<ReturnType<typeof parseDuoFinderMessage>>;
  isOwn: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1",
          isOwn ? "bg-white/15 text-white" : "bg-primary/15 text-foreground",
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            isOwn ? "bg-white/20" : "bg-gradient-primary",
          )}
        >
          <Swords className="h-3 w-3 text-white" />
        </span>
        <span className="truncate text-[11px] font-medium leading-none">
          Duo Finder · {parsed.gameLabel}
          {parsed.matchPercent != null ? ` · ${parsed.matchPercent}%` : ""}
        </span>
      </div>

      {parsed.reply ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {parsed.reply}
        </p>
      ) : null}
    </div>
  );
}

function MessageMeta({
  timestamp,
  deliveryStatus,
  isOwn,
}: {
  timestamp: string;
  deliveryStatus?: MessageInterface["deliveryStatus"];
  isOwn: boolean;
}) {
  return (
    <span className="mt-1 flex items-center justify-end gap-1 text-xs opacity-70">
      <span>{timestamp}</span>
      {isOwn && deliveryStatus ? (
        <span
          className="inline-flex shrink-0"
          title={
            deliveryStatus === "read"
              ? "Lida"
              : deliveryStatus === "delivered"
                ? "Entregue"
                : "Enviada"
          }
          aria-label={
            deliveryStatus === "read"
              ? "Lida"
              : deliveryStatus === "delivered"
                ? "Entregue"
                : "Enviada"
          }
        >
          {deliveryStatus === "sent" ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <CheckCheck
              className={cn(
                "h-3.5 w-3.5",
                deliveryStatus === "read" ? "text-sky-300" : undefined,
              )}
            />
          )}
        </span>
      ) : null}
    </span>
  );
}

function renderMessageBody(message: MessageInterface) {
  const duoReply = parseDuoFinderMessage(message.content);
  const megaphoneReply = duoReply ? null : parseMegaphoneReply(message.content);

  if (duoReply) {
    return <DuoFinderReplyBubble parsed={duoReply} isOwn={message.isOwn} />;
  }

  if (megaphoneReply) {
    return (
      <MegaphoneReplyBubble parsed={megaphoneReply} isOwn={message.isOwn} />
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
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
          const duoReply = message.sharedContent
            ? null
            : parseDuoFinderMessage(message.content);
          const isDuoReply = Boolean(duoReply);
          const isSharedCut = Boolean(message.sharedContent);

          return (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={cn(
                  isSharedCut && "max-w-[70%]",
                  isDuoReply &&
                    "max-w-[75%] overflow-hidden rounded-2xl p-3 shadow-sm",
                  !isSharedCut &&
                    !isDuoReply &&
                    "max-w-[70%] rounded-lg p-3",
                  !isSharedCut &&
                    (isDuoReply
                      ? message.isOwn
                        ? "bg-gradient-primary text-white"
                        : "border border-border/60 bg-muted/80"
                      : message.isOwn
                        ? "bg-gradient-primary text-white"
                        : "bg-muted"),
                )}
              >
                {message.sharedContent ? (
                  <SharedCutCard
                    content={message.sharedContent}
                    onClick={() => setOpenCutId(message.sharedContent!.id)}
                  />
                ) : (
                  renderMessageBody(message)
                )}
                <MessageMeta
                  timestamp={message.timestamp}
                  deliveryStatus={message.deliveryStatus}
                  isOwn={message.isOwn}
                />
              </div>
            </div>
          );
        })}
      </div>

      <SharedCutModal
        cutId={openCutId}
        onOpenChange={(open) => !open && setOpenCutId(null)}
      />
    </>
  );
}

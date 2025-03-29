"use client";
import React from "react";
import { RiArrowDownDoubleFill } from "react-icons/ri";
import ScrollToBottom from "../ScrollToBottom/ScrollToBottom";

function NewMessage({
  quantity,
  resetFunction,
  shouldScrollToBottom,
  newMessageId,
}: {
  quantity: number;
  resetFunction?: () => void;
  shouldScrollToBottom: boolean;
  newMessageId: number;
}) {
  return (
    <ScrollToBottom
      resetFunction={resetFunction}
      shouldScroll={shouldScrollToBottom}
      target={`${newMessageId}`}
    >
      <div className="flex gap-2 w-full text-center sticky h-12 bottom-0 justify-center items-center NewMessage-wrapper">
        <p>{quantity} novas mensagens</p>
        <RiArrowDownDoubleFill className="h-8 w-8 animate-bounce" />
      </div>
    </ScrollToBottom>
  );
}

export default NewMessage;

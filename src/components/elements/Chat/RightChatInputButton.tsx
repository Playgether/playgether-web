"use client";
import React from "react";
import { FaRegSmile } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";
import TextAreaLayout from "@/components/layouts/TextAreaLayout/TextAreaLayout";
import { handleKeyDown } from "@/components/layouts/SendOnEnterKey/sendOnEnterKey";

function RightChatInputButton() {
  const { sendMessage, setNewMessage, newMessage } = useChatHandlerContext();
  return (
    <>
      <div className="flex-1 RightChatInputWrapper-Input rounded-lg flex items-center px-3 py-2">
        <TextAreaLayout
          register={null}
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          maxRows={10}
          minRows={2}
          className="w-full"
          textAreaClassName="bg-transparent resize-none border-none focus:outline-none w-full text-sm"
          onKeyDown={(e) => handleKeyDown(e, sendMessage)}
        />
        <FaRegSmile className="ml-2" size={20} />
      </div>
      <button
        className="ml-3 p-2 RightChatInputWrapper-Send h-full"
        onClick={sendMessage}
      >
        <IoSend size={30} />
      </button>
    </>
  );
}

export default RightChatInputButton;

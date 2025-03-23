"use client";
import React from "react";
import { FaRegSmile } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useChatHandlerContext } from "@/context/ChatHandlerContext";

function RightChatInputButton() {
  const { sendMessage, setNewMessage, newMessage } = useChatHandlerContext();
  return (
    <>
      <div className="flex-1 RightChatInputWrapper-Input rounded-full flex items-center px-3 py-2">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="bg-transparent border-none focus:outline-none w-full text-sm"
        />
        <FaRegSmile className="ml-2" size={20} />
      </div>
      <button
        className="ml-3 p-2 RightChatInputWrapper-Send"
        onClick={sendMessage}
      >
        <IoSend size={20} />
      </button>
    </>
  );
}

export default RightChatInputButton;

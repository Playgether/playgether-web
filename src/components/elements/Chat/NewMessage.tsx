import React from "react";
import { RiArrowDownDoubleFill } from "react-icons/ri";

function NewMessage({ quantity }: { quantity: number }) {
  return (
    <div className="flex gap-2 w-full text-center sticky h-12 bottom-0 justify-center items-center NewMessage-wrapper">
      <p>{quantity} novas mensagens</p>
      <RiArrowDownDoubleFill className="h-8 w-8 animate-bounce" />
    </div>
  );
}

export default NewMessage;

import React from "react";
import { BiWindowClose } from "react-icons/bi";
function EmptyData({ text = "Sem dados" }: { text?: string }) {
  return (
    <div className="flex flex-col EmptyData-wrapper self-center justify-self-center items-center justify-center gap-3  w-full">
      <BiWindowClose className="h-12 w-12" />
      <p className="text-center">{text}</p>
    </div>
  );
}

export default EmptyData;

import React from "react";
import { RiArrowDownSLine } from "react-icons/ri";

function ExpandTextButton({ handleToggle }: { handleToggle: () => void }) {
  return (
    <div
      className="text-blue-400  pl-4 cursor-pointer p-2 text-center text-2xl flex gap-2 items-center justify-center"
      onClick={handleToggle}
    >
      <p className="text-base">Ver texto</p>
      <RiArrowDownSLine className="animate-bounce" />
    </div>
  );
}

export default ExpandTextButton;

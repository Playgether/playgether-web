import React from "react";
import { RiArrowUpSLine } from "react-icons/ri";

function HideTextButton({ handleToggle }: { handleToggle: () => void }) {
  return (
    <div
      className="PostTextPostExpand-toggle sticky bottom-0 pl-4 cursor-pointer p-2 text-center gap-2 text-2xl flex items-end justify-center flex-1"
      onClick={handleToggle}
    >
      <p className="text-base">Esconder texto</p>
      <RiArrowUpSLine className="animate-bounce" />
    </div>
  );
}

export default HideTextButton;

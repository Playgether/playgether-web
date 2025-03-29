import React from "react";
import { IoArrowDownCircle } from "react-icons/io5";

function ScrollToBottonIcon({
  executeScrollBottom,
}: {
  executeScrollBottom: () => void;
}) {
  return (
    <div className="relative">
      <IoArrowDownCircle
        className="z-10 fixed bottom-52 right-10 h-12 w-12 justify-self-end mr-2 ScrollToBottonIcon-wrapper cursor-pointer animate-fade-in delay-2000"
        onClick={() => executeScrollBottom()}
      />
    </div>
  );
}

export default ScrollToBottonIcon;

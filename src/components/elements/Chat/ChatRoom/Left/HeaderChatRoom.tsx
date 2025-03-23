import React from "react";
import { BsPersonFill } from "react-icons/bs";

function HeaderChatRoom() {
  return (
    <div className="p-4 flex items-center justify-center HeaderChat-wrapper border-b  flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex HeaderChatRoom-wrapper text-lg items-center justify-center gap-4">
          <BsPersonFill className="h-8 w-8" />
          <span>Participantes</span>
        </div>
      </div>
    </div>
  );
}

export default HeaderChatRoom;

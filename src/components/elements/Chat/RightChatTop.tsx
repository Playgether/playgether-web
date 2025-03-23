import React from "react";
import { MdCall, MdInfo, MdVideoCall } from "react-icons/md";

function RightChatTop() {
  return (
    <div className="p-3 border-b RightChatTop-wrapper flex justify-between items-center flex-shrink-0">
      <div className="flex items-center">
        <div className="relative mr-3">
          <img
            src="https://randomuser.me/api/portraits/women/8.jpg"
            alt="Scarlett Johansson"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0 h-3 w-3 RightChatTop-online rounded-full border-2 "></div>
        </div>
        <div>
          <h2 className="font-medium">Scarlett Johansson</h2>
          <p className="text-xs RightChatTop-hours-and-icons">Ativa há 1h</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 RightChatTop-hours-and-icons">
        {/* Icons to calls
        <MdCall size={20} className="cursor-pointer" />
        <MdVideoCall size={24} className="cursor-pointer" /> */}
        <MdInfo size={20} className="cursor-pointer" />
      </div>
    </div>
  );
}

export default RightChatTop;

import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { CiCircleInfo } from "react-icons/ci";
import { IoPeopleOutline } from "react-icons/io5";
import { MdOutlineChat } from "react-icons/md";

function RightChatRoomTop() {
  return (
    <div className="p-3 border-b RightChatTop-wrapper flex justify-between items-center flex-shrink-0 w-full">
      <div className="w-full flex justify-between pl-[10%] pr-[10%]">
        <AiOutlineHome className="h-8 w-8" />
        <MdOutlineChat className="h-8 w-8" />
        <IoPeopleOutline className="h-8 w-8" />
        <CiCircleInfo className="h-8 w-8" />
      </div>
    </div>
  );
}

export default RightChatRoomTop;

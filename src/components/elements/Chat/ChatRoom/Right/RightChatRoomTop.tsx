import React from "react";
import { AiOutlineHome } from "react-icons/ai";
import { CiCircleInfo } from "react-icons/ci";
import { IoPeopleOutline } from "react-icons/io5";
import { MdOutlineChat } from "react-icons/md";

function RightChatRoomTop({
  handleRightChatActive,
}: {
  handleRightChatActive: (key: string) => void;
}) {
  return (
    <div className="border-b RightChatTop-wrapper flex justify-between items-center flex-shrink-0 w-full">
      <div className="w-full flex justify-between">
        <AiOutlineHome
          className="h-8 w-full cursor-pointer RightChatRoomTop-wrapper"
          onClick={() => handleRightChatActive("description")}
        />
        <MdOutlineChat
          className="h-8 w-full cursor-pointer RightChatRoomTop-wrapper"
          onClick={() => handleRightChatActive("chat")}
        />
        <IoPeopleOutline className="h-8 w-full cursor-pointer RightChatRoomTop-wrapper" />
        <CiCircleInfo
          className="h-8 w-full cursor-pointer RightChatRoomTop-wrapper"
          onClick={() => handleRightChatActive("informations")}
        />
      </div>
    </div>
  );
}

export default RightChatRoomTop;

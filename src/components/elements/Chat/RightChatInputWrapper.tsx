import React from "react";
import { BiSolidImageAdd } from "react-icons/bi";
import { FaRegSmile } from "react-icons/fa";
import { HiMicrophone } from "react-icons/hi";
import { IoSend, IoAttach } from "react-icons/io5";
import RightChatInputButton from "./RightChatInputButton";

function RightChatInputWrapper() {
  return (
    <div className="px-4 py-3 border-t RightChatInputWrapper-wrapper flex items-center flex-shrink-0">
      {/* <div className="flex gap-2 mr-3">
        Future Features 
        <button className="p-2 rounded-full hover:bg-[#6b5bc4]">
          <IoAttach size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-[#6b5bc4]">
          <BiSolidImageAdd size={20} />
        </button> 
         <button className="p-2 rounded-full RightChatInputWrapper-Icons">
          <HiMicrophone size={20} />
        </button> 
      </div> */}
      {/* 
      <button className="ml-3 p-2 RightChatInputWrapper-Send">
        <IoSend size={20} />
      </button> */}
      <RightChatInputButton />
    </div>
  );
}

export default RightChatInputWrapper;

import React from "react";
import Link from "next/link";
import { HiOutlineHome } from "react-icons/hi2";
import { PiDoorOpen } from "react-icons/pi";
import { GoPeople } from "react-icons/go";
import { IoPersonOutline } from "react-icons/io5";
import { BiShield } from "react-icons/bi";
import Chat from "../elements/Chat/Chat";
import AsideBaseChat from "./AsideBaseChat";

const AsideBase = ({}) => {
  return (
    <div className="AsideBase-wrapper w-16 rounded-lg shadow-lg ml-2 mt-2 mb-2 mr-2 h-full max-h-full hidden md:flex flex-col items-center pt-4 pb-4 justify-between">
      <Link href={"/feed"}>
        <HiOutlineHome className="h-8 w-8 cursor-pointer" />
      </Link>
      <AsideBaseChat>
        <Chat />
      </AsideBaseChat>
      <IoPersonOutline className="h-8 w-8 cursor-pointer" />
      <GoPeople className="h-8 w-8 cursor-pointer" />
      <BiShield className="h-8 w-8 cursor-pointer" />
      <Link href={"/rooms"}>
        <PiDoorOpen className="h-8 w-8 cursor-pointer" />
      </Link>
    </div>
  );
};

export default AsideBase;

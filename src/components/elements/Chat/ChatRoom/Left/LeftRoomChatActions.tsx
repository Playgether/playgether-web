"use client";
import React, { useState } from "react";
import { MdStarBorder } from "react-icons/md";
import { MdStar } from "react-icons/md";
import { LuDoorOpen } from "react-icons/lu";
import { motion } from "framer-motion";
import Link from "next/link";

function LeftRoomChatActions() {
  const [favorite, setFavorite] = useState(false);

  return (
    <div className="flex w-full items-center justify-between LeftChatRoomActions-wrapper p-2">
      {favorite ? (
        <motion.div className="LeftChatRoomActionsStar flex flex-col items-center w-1/2 motion-scale-in-75 motion-preset-fade-md">
          <MdStar
            className="h-8 w-8 cursor-pointer"
            onClick={() => setFavorite(false)}
          />
          <span className="cursor-pointer" onClick={() => setFavorite(false)}>
            Desfavoritar
          </span>
        </motion.div>
      ) : (
        <div className="LeftChatRoomActionsStar flex flex-col items-center w-1/2  motion-scale-in-75 motion-preset-fade-md">
          <MdStarBorder
            className="h-8 w-8 LeftChatRoomActionsStar cursor-pointer"
            onClick={() => setFavorite(true)}
          />
          <span className="cursor-pointer" onClick={() => setFavorite(true)}>
            Favoritar
          </span>
        </div>
      )}
      <div className="LeftChatRoomActionsDoor w-1/2">
        <Link href={"/rooms"} className="w-full flex flex-col items-center">
          <LuDoorOpen className="h-8 w-8 ml-2 text-red-500" />
          <span>Sair da sala</span>
        </Link>
      </div>
    </div>
  );
}

export default LeftRoomChatActions;

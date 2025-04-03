"use client";
import React, { useState } from "react";
import { MdStarBorder } from "react-icons/md";
import { MdStar } from "react-icons/md";
import { LuDoorOpen } from "react-icons/lu";
import { motion } from "framer-motion";
import Link from "next/link";
import { favoriteToggleChatRoom } from "@/actions/favoriteToggleChatRoom";

function LeftRoomChatActions({
  room_id,
  is_favorited,
}: {
  room_id: number;
  is_favorited: boolean;
}) {
  const [favorite, setFavorite] = useState(is_favorited);

  const handleFavorite = (action: boolean) => {
    setFavorite(action);
    action
      ? favoriteToggleChatRoom(room_id, "POST")
      : favoriteToggleChatRoom(room_id, "DELETE");
  };

  return (
    <div className="flex w-full items-center justify-between LeftChatRoomActions-wrapper p-2">
      {favorite ? (
        <motion.div className="LeftChatRoomActionsStar flex flex-col items-center w-1/2 motion-scale-in-75 motion-preset-fade-md">
          <MdStar
            className="h-8 w-8 cursor-pointer"
            onClick={() => handleFavorite(false)}
          />
          <span
            className="cursor-pointer"
            onClick={() => handleFavorite(false)}
          >
            Desfavoritar
          </span>
        </motion.div>
      ) : (
        <div className="LeftChatRoomActionsStar flex flex-col items-center w-1/2  motion-scale-in-75 motion-preset-fade-md">
          <MdStarBorder
            className="h-8 w-8 LeftChatRoomActionsStar cursor-pointer"
            onClick={() => handleFavorite(true)}
          />
          <span className="cursor-pointer" onClick={() => handleFavorite(true)}>
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

import React from "react";
import DefaultButton from "@/components/elements/DefaultButton/DefaultButton";
import { RxPerson } from "react-icons/rx";
import Image from "next/legacy/image";

function CardRoomContainer() {
  return (
    <div className="h-[384px] w-[350px] border CardRoomContainer-wrapper rounded-md motion-preset-fade-lg">
      <div className="h-1/2">
        <Image
          src={"/rooms/images.jpg"}
          className="rounded-t-md"
          objectFit="cover"
          width={350}
          height={191}
          alt={"logo com o nome"}
        />
      </div>
      <div className="h-1/2 space-y-3 p-4">
        <h1 className="text-2xl font-semibold">psychedelic</h1>
        <p className="text-sm w-[90%]">
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </p>
        <div className="w-full flex justify-between">
          <DefaultButton className="py-2 px-8 font-medium">
            Entrar
          </DefaultButton>
          <div className="flex gap-2 CardRoomContainer-online items-end">
            <RxPerson className="h-7" />
            <span>15/30</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardRoomContainer;

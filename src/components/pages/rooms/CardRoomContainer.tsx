"use client";
import React from "react";
import DefaultButton from "@/components/elements/DefaultButton/DefaultButton";
import { RxPerson } from "react-icons/rx";
import Link from "next/link";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";

function CardRoomContainer({
  banner,
  name,
  summary,
  id,
}: {
  banner: string;
  summary: string;
  name: string;
  id: number;
}) {
  return (
    <div
      className="h-[384px] w-[350px] border CardRoomContainer-wrapper rounded-md motion-preset-fade-lg justify-self-start mb-4"
      key={id}
    >
      <div className="h-1/2 relative">
        <ImageComponent media_id={banner} width={400} />
      </div>
      <div className="h-1/2 space-y-3 p-4 flex flex-col">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-sm w-[90%] flex-1">{summary}</p>
        <div className="w-full flex justify-between">
          <form action={`/rooms/validate/${name}`} method="get">
            <DefaultButton type="submit" className="py-2 px-8 font-medium">
              Entrar
            </DefaultButton>
          </form>
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

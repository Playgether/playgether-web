"use client";
import React from "react";
import DefaultButton from "@/components/elements/DefaultButton/DefaultButton";
import { RxPerson } from "react-icons/rx";
import Link from "next/link";
import { CldImage } from "next-cloudinary";

function CardRoomContainer({
  banner,
  name,
  summary,
}: {
  banner: string;
  summary: string;
  name: string;
}) {
  return (
    <div className="h-[384px] w-[350px] border CardRoomContainer-wrapper rounded-md motion-preset-fade-lg justify-self-start mb-4">
      <div className="h-1/2 relative">
        <CldImage
          src={banner}
          width={480}
          height={0}
          alt="Banner"
          style={{
            maxHeight: 191,
            objectFit: "cover",
          }}
        />
      </div>
      <div className="h-1/2 space-y-3 p-4 flex flex-col">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-sm w-[90%] flex-1">{summary}</p>
        <div className="w-full flex justify-between">
          <Link href={`/rooms/${name}`}>
            <DefaultButton className="py-2 px-8 font-medium">
              Entrar
            </DefaultButton>
          </Link>
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

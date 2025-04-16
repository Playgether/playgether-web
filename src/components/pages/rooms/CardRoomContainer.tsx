"use client";
import React from "react";
import ImageComponent from "@/components/layouts/ImageComponent/ImageComponent";
import CardRoomEnter from "./CardRoomEnter";

export default function CardRoomContainer({
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
    <div className="h-[384px] min-w-[300px] max-w-[350px] border CardRoomContainer-wrapper rounded-md motion-preset-fade-lg justify-self-start mb-4 relative" key={id}>
      <div className="h-1/2 relative">
        <ImageComponent media_id={banner} width={400} />
      </div>
      <div className="h-1/2 space-y-3 p-4 flex flex-col">
        <h1 className="text-2xl font-semibold">{name}</h1>
        <p className="text-sm w-[90%] flex-1">{summary}</p>
        <CardRoomEnter name={name}/>
      </div>
    </div>
  );
}
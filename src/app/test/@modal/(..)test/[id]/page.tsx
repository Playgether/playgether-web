import { myObjects } from "@/app/test/myObjects";
import React from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const objSelected = myObjects.find((obj) => obj.id === id);
  console.log("Modal Page");

  return (
    <div className="mb-4 border bg-black p-4 text-white">
      <h2 className="text-xl font-bold">{objSelected?.name}</h2>
      <p className="text-gray-300">{objSelected?.description}</p>
    </div>
  );
}

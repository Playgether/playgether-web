import { myObjects } from "@/app/test/page";
import React from "react";

// CORREÇÃO: Remova o "await" do params
export default async function Page({ params }: { params: { id: string } }) {
  // params já é async, então acesse diretamente
  const { id } = params;
  const objSelected = myObjects.find((obj) => obj.id === id);
  console.log("Modal Page");

  return (
    <div className="mb-4 border bg-black p-4 text-white">
      <h2 className="text-xl font-bold">{objSelected?.name}</h2>
      <p className="text-gray-300">{objSelected?.description}</p>
    </div>
  );
}

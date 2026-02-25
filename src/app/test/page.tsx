import Link from "next/link";
import React from "react";
import { myObjects } from "@/app/test/myObjects";

export default function page() {
  return (
    <div className="bg-black-200 p-4 text-white h-screen w-screen flex flex-col items-center justify-center gap-5">
      <div className="flex gap-10">
        {myObjects.map((obj) => (
          <div
            className="flex gap-5 border border-purple-500 p-5 rounded"
            key={obj.id}
          >
            <div className="mb-4 border">
              <h2 className="text-xl font-bold">{obj.name}</h2>
              <p className="text-gray-300">{obj.description}</p>
            </div>
            <Link href={`/test/${obj.id}`}>
              <button className="rounded bg-purple-500 px-5 py-3 cursor-pointer hover:bg-purple-600 transition">
                Click Me
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

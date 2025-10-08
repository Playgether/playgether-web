import Link from "next/link";
import React from "react";

export const myObjects = [
  {
    id: "1",
    name: "Test Object 1",
    description: "This is a test object 1",
  },
  {
    id: "2",
    name: "Test Object 2",
    description: "This is a test object 2",
  },
  {
    id: "3",
    name: "Test Object 3",
    description: "This is a test object 3",
  },
  {
    id: "4",
    name: "Test Object 4",
    description: "This is a test object 4",
  },
];

export default function page() {
  return (
    <div className="bg-black-200 p-4 text-white h-screen w-screen flex flex-col items-center justify-center gap-5">
      <div className="flex gap-10">
        {myObjects.map((obj, index) => (
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

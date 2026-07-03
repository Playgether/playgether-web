"use client";
import React from "react";

export default function LayoutTypeHandlerContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full lg:ml-20">
      <div className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-6">{children}</div>
    </div>
  );
}

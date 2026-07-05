"use client";
import React from "react";

export default function LayoutTypeHandlerContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-w-0 max-w-full lg:pl-20">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-4 lg:py-4 xl:px-6 xl:py-6">
        {children}
      </div>
    </div>
  );
}

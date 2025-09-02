"use client";
import { useIsMobile } from "@/context/MobileContext";
import React from "react";

export default function LayoutTypeHandlerContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  return (
    <div className={`mb-[120px] ${isMobile ? "ml-0" : "ml-20"} pt-16`}>
      <div className="max-w-7xl mx-auto px-6 py-6">{children}</div>
    </div>
  );
}

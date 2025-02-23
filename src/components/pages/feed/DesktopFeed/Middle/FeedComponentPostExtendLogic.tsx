"use client";
import React from "react";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";

export default function FeedComponentPostExtendLogic({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openPostsExtend, resourceObject } = useMiddleFeedContext();
  if (!openPostsExtend || !resourceObject) {
    return null;
  }

  return <>{children}</>;
}

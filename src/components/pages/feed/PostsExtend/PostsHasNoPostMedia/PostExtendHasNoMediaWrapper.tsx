"use client";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";
import React from "react";

function PostExtendHasNoMediaWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resourceObject } = useMiddleFeedContext();
  return <>{resourceObject && <>{children}</>}</>;
}

export default PostExtendHasNoMediaWrapper;

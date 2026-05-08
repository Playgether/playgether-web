import React from "react";
import LayoutTypeHandlerWrapper from "./LayoutTypeHandlerWrapper";
import { OpenCreatePostFromQuery } from "./OpenCreatePostFromQuery";

export default function FeedPage() {
  return (
    <>
      <OpenCreatePostFromQuery />
      <LayoutTypeHandlerWrapper />
    </>
  );
}

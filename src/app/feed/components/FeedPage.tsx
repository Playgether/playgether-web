import React from "react";
import { CreatePostModal } from "./CreatePostModal";
import LayoutTypeHandlerWrapper from "./LayoutTypeHandlerWrapper";

export default function FeedPage() {
  return (
    <>
      <LayoutTypeHandlerWrapper />
      <CreatePostModal />
    </>
  );
}

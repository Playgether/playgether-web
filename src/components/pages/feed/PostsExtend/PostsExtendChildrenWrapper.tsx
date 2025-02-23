import React from "react";
import PostsExtendChildrenContainer from "./PostsExtendChildrenContainer";
import { ClosePostExpand } from "./ClosePostExpand";

function PostsExtendChildrenWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostsExtendChildrenContainer>
      <div className="flex w-11/12 bg-white shadow-lg mt-[60px] mb-[20px] gap-[2px] max-w-[1920px] max-h-[1080px]">
        {children}
        <ClosePostExpand />
      </div>
    </PostsExtendChildrenContainer>
  );
}

export default PostsExtendChildrenWrapper;

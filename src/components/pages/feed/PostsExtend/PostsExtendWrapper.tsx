import React from "react";
import PostsExtendChildrenContainer from "./PostsExtendChildrenContainer";
import { ClosePostExpand } from "./ClosePostExpand";
import PostExtendHasNoMediaWrapper from "./PostsHasNoPostMedia/PostExtendHasNoMediaWrapper";
import PostsExtendHasNoPostMedia from "./PostsHasNoPostMedia/PostsExtendHasNoPostMedia";

function PostsExtendWrapper() {
  return (
    <PostsExtendChildrenContainer>
      <div className="flex w-11/12 bg-white shadow-lg mt-[60px] mb-[20px] gap-[2px] max-w-[1920px] max-h-[1080px]">
        <PostExtendHasNoMediaWrapper>
          <PostsExtendHasNoPostMedia />
        </PostExtendHasNoMediaWrapper>
        <ClosePostExpand />
      </div>
    </PostsExtendChildrenContainer>
  );
}

export default PostsExtendWrapper;

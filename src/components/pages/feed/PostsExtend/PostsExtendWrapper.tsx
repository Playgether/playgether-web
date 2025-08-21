// "use client"
import PostsExtendChildrenContainer from "./PostsExtendChildrenContainer";
import { ClosePostExpand } from "./ClosePostExpand";
import PostsExtendLogic from "./PostsExtendLogic";

function PostsExtendWrapper() {
  return (
    <PostsExtendChildrenContainer>
      <div className="flex w-11/12 bg-white shadow-lg mt-[60px] mb-[20px] gap-[2px] max-w-[1920px] max-h-[1080px]">
        <PostsExtendLogic/>
        <ClosePostExpand />
      </div>
    </PostsExtendChildrenContainer>
  );
}

export default PostsExtendWrapper;

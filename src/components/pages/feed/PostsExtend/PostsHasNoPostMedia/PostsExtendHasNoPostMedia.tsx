"use client";
import { useState } from "react";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";
import PostsExtendHasNoPostLogic from "./PostsExtendHasNoPostLogic";

const PostsExtendHasNoPostMedia = () => {
  const { resourceObject } = useMiddleFeedContext();
  const [isExtended, setIsExtended] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleToggle = () => {
    setIsExtended((prev) => !prev);
    setHasInteracted(true);
  };
  return (
    <>
      {resourceObject && (
        <PostsExtendHasNoPostLogic
          isExtended={isExtended}
          hasInteracted={hasInteracted}
          handleToggle={handleToggle}
          resourceObject={resourceObject}
        />
      )}
    </>
  );
};

export default PostsExtendHasNoPostMedia;

"use client";

import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { FeedProps } from "../../../../../services/getFeed";
import PostsExtend from "../../PostsExtend/PostsExtend";
import VirtualizedFeed from "./VirtualizedFeed";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";

interface ApiResponse {
  data: FeedProps[];
}

const FeedComponent = () => {
  const [openPostsExtend, setOpenPostsExtend] = useState(false);
  const [resourceObject, setResourceObject] = useState<FeedProps>();
  const [slideIndex, setSlideIndex] = useState(0);
  const [saveSlideIndexOnOpen, setSaveSlideIndexOnOpen] = useState(0);

  const handlePostsCloseExtend = () => {
    setOpenPostsExtend(!openPostsExtend);
    setSlideIndex(saveSlideIndexOnOpen);
  };

  const handlePostsExtend = (resourceObject) => {
    setResourceObject(resourceObject);
    setOpenPostsExtend(!openPostsExtend);
    setSaveSlideIndexOnOpen(slideIndex);
  };

  return (
    <div>
      {openPostsExtend && !!resourceObject && (
        <div className="h-screen">
          <PostsExtend
            resource={resourceObject}
            onClose={handlePostsCloseExtend}
            slideIndex={slideIndex}
          />
        </div>
      )}
      <Suspense fallback={<LoadingComponent />}>
        <VirtualizedFeed
          handlePostsExtend={handlePostsExtend}
          setSlideIndex={setSlideIndex}
        />
      </Suspense>
    </div>
  );
};

export default FeedComponent;

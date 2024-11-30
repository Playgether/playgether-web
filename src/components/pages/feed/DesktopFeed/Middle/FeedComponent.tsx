'use client'

import React, { useCallback, useMemo, useRef, useState } from "react";
import { FeedProps,} from "../../../../../services/getFeed";
import PostsExtend from "../../PostsExtend/PostsExtend";
import VirtualizedFeed from "./VirtualizedFeed";


interface ApiResponse {
  data: FeedProps[];
}

const FeedComponent = () => {
  const [openPostsExtend, setOpenPostsExtend] = useState(false)
  const [resourceObject, setResourceObject] = useState<FeedProps>()
  const [slideIndex, setSlideIndex] = useState(0)

  const handlePostsCloseExtend = () => {
    setOpenPostsExtend(!openPostsExtend)
  }

  const handlePostsExtend = (resourceObject) => {
    setResourceObject(resourceObject)
    setOpenPostsExtend(!openPostsExtend)
  }


  return (
      <div>
      {openPostsExtend && !!resourceObject && 
        <div className="h-screen bg-red-500">
          <PostsExtend resource={resourceObject} onClose={handlePostsCloseExtend} slideIndex={slideIndex}/>
        </div>
      }
      <VirtualizedFeed handlePostsExtend={handlePostsExtend} setSlideIndex={setSlideIndex}/>
    </div>
  );
};

export default FeedComponent;

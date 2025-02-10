'use client'

import { FeedProps } from "@/services/getFeed";
import React, { useState } from "react";
import VirtualizedFeed from "../DesktopFeed/Middle/VirtualizedFeed";
import ResponsivePostsExtend from "./ResponsivePostExtend/ResponsivePostExtend";

const ResponsiveFeed = () => {
  const [openPostsExtend, setOpenPostsExtend] = useState<boolean>(false)
  const [resourceObject, setResourceObject] = useState<FeedProps>()
  const [slideIndex, setSlideIndex] = useState<number>(0)
  const [saveSlideIndexOnOpen, setSaveSlideIndexOnOpen] = useState<number>(0)

  const handlePostsCloseExtend = () => {
    setOpenPostsExtend(!openPostsExtend)
    setSlideIndex(saveSlideIndexOnOpen)
  }

  const handlePostsExtend = (resourceObject) => {
    setResourceObject(resourceObject)
    setOpenPostsExtend(!openPostsExtend)
    setSaveSlideIndexOnOpen(slideIndex)
  }


  return (
      <div>
        {openPostsExtend && !!resourceObject && 
          <div className="h-screen">
            <ResponsivePostsExtend resource={resourceObject} onClose={handlePostsCloseExtend} slideIndex={slideIndex}/>
          </div>
        }
        <VirtualizedFeed handlePostsExtend={handlePostsExtend} setSlideIndex={setSlideIndex}/>
      </div>
  );
};

export default ResponsiveFeed;

import FeedComponentPostExtendLogic from "@/components/pages/feed/DesktopFeed/Middle/FeedComponentPostExtendLogic";
import PostsExtendWrapper from "@/components/pages/feed/PostsExtend/PostsExtendWrapper";
import React from "react";

export default function page() {
  return (
    <FeedComponentPostExtendLogic>
      <PostsExtendWrapper />
    </FeedComponentPostExtendLogic>
  );
}

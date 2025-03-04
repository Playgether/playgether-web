import React, { Suspense } from "react";
import { UploadCompoent } from "./Upload/UploadComponent";
import FeedComponent from "./FeedComponent";
import FeedComponentPostExtendLogic from "./FeedComponentPostExtendLogic";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import VirtualizedFeed from "./VirtualizedFeed";
import PostsExtendWrapper from "../../PostsExtend/PostsExtendWrapper";

function MiddlePosts() {
  return (
    <>
      <UploadCompoent />
      <FeedComponent>
        <FeedComponentPostExtendLogic>
          <PostsExtendWrapper />
        </FeedComponentPostExtendLogic>
        <Suspense fallback={<LoadingComponent />}>
          <VirtualizedFeed />
        </Suspense>
      </FeedComponent>
    </>
  );
}

export default MiddlePosts;

import React, { Suspense } from "react";
import { UploadCompoent } from "./Upload/UploadComponent";
import FeedComponent from "./FeedComponent";
import FeedComponentPostExtendLogic from "./FeedComponentPostExtendLogic";
import { LoadingComponent } from "@/components/layouts/components/LoadingComponent";
import VirtualizedFeed from "./VirtualizedFeed";
import PostsExtendChildrenWrapper from "../../PostsExtend/PostsExtendChildrenWrapper";
import PostExtendHasNoMediaWrapper from "../../PostsExtend/PostsHasNoPostMedia/PostExtendHasNoMediaWrapper";
import PostsExtendHasNoPostMedia from "../../PostsExtend/PostsHasNoPostMedia/PostsExtendHasNoPostMedia";

function MiddlePosts() {
  return (
    <>
      <UploadCompoent />
      <FeedComponent>
        <FeedComponentPostExtendLogic>
          <PostsExtendChildrenWrapper>
            <PostExtendHasNoMediaWrapper>
              <PostsExtendHasNoPostMedia />
            </PostExtendHasNoMediaWrapper>
          </PostsExtendChildrenWrapper>
        </FeedComponentPostExtendLogic>
        <Suspense fallback={<LoadingComponent />}>
          <VirtualizedFeed />
        </Suspense>
      </FeedComponent>
    </>
  );
}

export default MiddlePosts;

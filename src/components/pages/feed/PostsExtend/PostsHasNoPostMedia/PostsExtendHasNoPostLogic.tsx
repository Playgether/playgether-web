"use client";
import React, { Suspense } from "react";
import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername";
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine";
import { PostTextPostExpand } from "../PostTextPostExpand/PostTextPostExpand";
import { CommentSectionFallback } from "@/components/layouts/SuspenseFallBack/CommentSectionFallback/CommentSectionFallback";
import CommentSectionFetchData from "../CommentsSection/CommentSectionFetchData/CommentSectionFetchData";
import CommentInput from "../../DesktopFeed/MultUseComponents/CommentInput/CommentInput";

function PostsExtendHasNoPostLogic({
  isExtended,
  hasInteracted,
  handleToggle,
  resourceObject,
}) {
  return (
    <>
      <div className="w-3/6 PostsExtendHasNoPostMedia-left overflow-y-auto overflow-x-hidden">
        <ProfileAndUsername
          profile_photo={resourceObject.created_by_user_photo}
          username={resourceObject.created_by_user_name}
          timestamp={resourceObject.timestamp}
          imageClassName="mt-3 ml-3 h-8 w-8"
        />
        <BorderLine />
        <PostTextPostExpand
          text={resourceObject.comment}
          created_by_user_name={resourceObject.created_by_user_name}
          created_by_user_photo={resourceObject.created_by_user_photo}
          timestamp={resourceObject.timestamp}
          showExpandButton={false}
          isExtended={isExtended}
          hasInteracted={hasInteracted}
          handleToggle={handleToggle}
          resourceObject={resourceObject}
        ></PostTextPostExpand>
      </div>
      <div className="w-3/6 overflow-hidden PostsExtendHasNoPostMedia-right">
        <div className="h-full w-full flex flex-col relative">
          <BorderLine />
          <div className="w-full h-[calc(100%-80px)] overflow-y-auto overflow-x-hidden">
            <Suspense fallback={<CommentSectionFallback />}>
              <CommentSectionFetchData postId={resourceObject.id} />
            </Suspense>
          </div>
          <CommentInput id={resourceObject.id} />
        </div>
      </div>
    </>
  );
}

export default PostsExtendHasNoPostLogic;

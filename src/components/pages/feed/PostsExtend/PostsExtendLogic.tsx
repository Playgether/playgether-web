"use client";
import { useMiddleFeedContext } from "@/context/MiddleFeedContext";
import React from "react";
import PostsExtendHasPostMedia from "./PostsHasPostMedia/PostsExtendHasPostMedia";
import PostsExtendHasNoPostMedia from "./PostsHasNoPostMedia/PostsExtendHasNoPostMedia";
import { CommentsContextProvider } from "@/context/CommentsContext";
import CommentSectionFetchData from "./CommentsSection/CommentSectionFetchData/CommentSectionFetchData";
import { useParams } from "next/navigation";

function PostsExtendLogic() {
  const { resourceObject } = useMiddleFeedContext();
  const params = useParams();
  const postId = params?.postId;
  
  if (!resourceObject) {
    return null;
  }

  return (
    <CommentsContextProvider>
      {resourceObject.has_post_media ? (
        <PostsExtendHasPostMedia>
          <CommentSectionFetchData postId={postId}/>
        </PostsExtendHasPostMedia>
      ) : (
        <PostsExtendHasNoPostMedia />
      )}
    </CommentsContextProvider>
  );
}

export default PostsExtendLogic;
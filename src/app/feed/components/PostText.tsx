import TextLimitComponent from "@/components/layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";
import React from "react";

export default function PostText({ post, handlePostClick }) {
  return (
    <div className="mb-4">
      <TextLimitComponent text={post.comment} maxCharacters={300} />
      {/* <p
        className="text-foreground leading-relaxed cursor-pointer hover:text-primary/80 transition-colors"
        onClick={handlePostClick}
      >
        {post.comment}
      </p> */}
    </div>
  );
}

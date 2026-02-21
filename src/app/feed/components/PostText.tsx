import React from "react";

export default function PostText({ post, handlePostClick }) {
  return (
    <div className="mb-4">
      <p
        className="text-foreground leading-relaxed cursor-pointer hover:text-primary/80 transition-colors line-clamp-5 whitespace-pre-wrap"
        onClick={handlePostClick}
      >
        {post.comment}
      </p>
    </div>
  );
}

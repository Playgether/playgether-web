import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";

export default function RepostFlag({ post }) {
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerFeedPost.icons;
  return (
    <div className="flex items-center space-x-2 mb-3 text-muted-foreground text-sm">
      {icons.Share}
      <span>{post.repost_by_name} repostou</span>
    </div>
  );
}

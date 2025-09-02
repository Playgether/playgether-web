"use client";
import { useIsMobile } from "@/context/MobileContext";
import React from "react";
import { useFeedServerContext } from "../context/FeedServerContext";
import { useFeedContext } from "../context/FeedContext";
import { Button } from "@/components/ui/button";

export default function LayoutTypeHandler({
  FeedPost,
  CenterColumn,
}: {
  FeedPost: JSX.Element;
  CenterColumn: JSX.Element;
}) {
  const isMobile = useIsMobile();
  const { Feed } = useFeedServerContext();
  const icons = Feed.ServerFeedPage.icons;
  const components = Feed.ServerFeedPage.components;
  const { handleCreatePostModal, posts } = useFeedContext();
  return (
    <>
      {isMobile ? (
        /* Mobile Layout - Only Feed */
        <div className="space-y-6">
          {/* Create Post Button */}
          <div className="mb-6">
            <Button
              onClick={() => handleCreatePostModal(true)}
              className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {icons.Plus}
              Compartilhe algo conosco
            </Button>
          </div>

          {posts.map((post, index) => (
            <div key={post.id} style={{ animationDelay: `${index * 200}ms` }}>
              {React.cloneElement(FeedPost, { post: post })}
            </div>
          ))}
        </div>
      ) : (
        /* Desktop Layout - Full Grid */
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - User Profile & Friends */}
          {components.LeftColumn}

          {/* Center Column - Feed */}
          {CenterColumn}

          {/* Right Column - Notifications & Trending */}
          {components.RightColumn}
        </div>
      )}
    </>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import React from "react";
import { FeedPost } from "./FeedPost";
import { useFeedContext } from "../context/FeedContext";

export default function CenterColumn() {
  const { handleRepost, handlePostUpdate, handleCreatePostModal, posts } =
    useFeedContext();
  return (
    <div className="col-span-6 space-y-6">
      {/* Create Post Button */}
      <div className="mb-6">
        <Button
          onClick={() => handleCreatePostModal(true)}
          className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-6 h-6 mr-3" />
          Compartilhe algo conosco
        </Button>
      </div>

      {posts.map((post, index) => (
        <div key={post.id} style={{ animationDelay: `${index * 200}ms` }}>
          <FeedPost
            post={post}
            onPostUpdate={(updatedPost) =>
              handlePostUpdate(updatedPost, post.id)
            }
            onRepost={handleRepost}
          />
        </div>
      ))}
    </div>
  );
}

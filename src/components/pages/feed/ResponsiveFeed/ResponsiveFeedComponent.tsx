"use client";

import PostText from "../../../layouts/PostText/PostText";
import { NameAndUsernameResponsive } from "./PostsComponents/NameAndUsername";
import { CiShare1 } from "react-icons/ci";
import PostProperies from "../DesktopFeed/Middle/PostsComponents/PostsProperies";
import { useFeedContext } from "../../../../context/FeedContext";
import React, { useState } from "react";
import Posts from "../DesktopFeed/Middle/PostsComponents/Posts/Posts";
import { FeedProps } from "../../../../services/getFeed";
import TogglePostComponentLogic from "../CommonComponents/TogglePostComponentLogic";
import { TogglePostComponent } from "../CommonComponents/TogglePostComponent";

const resource = {
  comment: "Test Comment",
};

export const ResponsiveFeedComponent = () => {
  const { feed } = useFeedContext();

  const [slideIndex, setSlideIndex] = useState(0);
  const [resourceState, setResourceState] = useState<FeedProps>();
  const [openPostsExtend, setOpenPostsExtend] = useState(false);

  const handlePostsExtend = (resourceState) => {
    setResourceState(resourceState);
    setOpenPostsExtend(!openPostsExtend);
  };

  return (
    <>
      <TogglePostComponent>
        <TogglePostComponentLogic />
      </TogglePostComponent>
      {feed &&
        feed.map((post) => (
          <React.Fragment key={post.id}>
            <div className="flex justify-between items-center bg-white-200">
              <NameAndUsernameResponsive
                username={post.created_by_user_name}
                profile_photo={post.created_by_user_photo}
              />
              <CiShare1 className="h-8 w-8 text-orange-500 mr-4" />
            </div>
            <div className="pt-4 flex justify-between pb-2 bg-white-200">
              <PostText resource={post} maxCharacteres={150} />
            </div>
            <div className="h-full w-full relative flex-grow bg-white-200">
              {post?.has_post_media ? (
                <div className="bg-white-200 h-4/6">
                  <Posts
                    media={post.medias}
                    // onExpand={() => handlePostsExtend(post)} setSlideIndex={setSlideIndex} postsSize="h-full" className="h-5/6"/>
                  />
                </div>
              ) : null}
            </div>
            <div className="mb-5 shadow-lg">
              <PostProperies
                quantity_comment={post.quantity_comment}
                quantity_likes={post.quantity_likes}
                quantity_reposts={post.quantity_reposts}
                user_already_like={post.user_already_like}
                object_id={post.id}
              />
            </div>
          </React.Fragment>
        ))}
    </>
  );
};

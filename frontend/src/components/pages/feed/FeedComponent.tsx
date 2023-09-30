'use client'

import React, { useState } from "react";
import { useResource } from "../../custom_hooks/useResource";
import { getFeed } from "../../../services/getFeed";
import { FeedProps } from "../../../services/getFeed";
import { useAuthContext } from "../../../context/AuthContext";
import Posts from "./Posts";
import PostProperies from "./PostsProperies";
import PostText from "../../layouts/PostText";
import PostsExtend from "./PostsExtend";
import ProfileAndUsername from "../../layouts/components/ProfileAndUsername";

interface ApiResponse {
  data: FeedProps[];
}

const FeedComponent = () => {
  const { user, authTokens } = useAuthContext();
  const { resources } = useResource<ApiResponse>(() => getFeed(authTokens, user?.user_id)); 
  const [openPostsExtend, setOpenPostsExtend] = useState(false)
  const [resourceState, setResourceState] = useState<FeedProps>()
  const [slideIndex, setSlideIndex] = useState(0)

  const handlePostsCloseExtend = () => {
    setOpenPostsExtend(!openPostsExtend)
  }

  const handlePostsExtend = (resourceState) => {
    setResourceState(resourceState)
    setOpenPostsExtend(!openPostsExtend)
  }
  

  return (
      <>
      {openPostsExtend && !!resourceState && 
        <div className="h-5/6">
          <PostsExtend resource={resourceState} onClose={handlePostsCloseExtend} slideIndex={slideIndex}/>
        </div>
      }
        {resources && resources.data.map((resource) => (
          <>
          <div className="bg-white-200 flex items-start justify-start" key={resource.id}>
              <ProfileAndUsername 
              username={resource.created_by_user_name}
              profile_photo={resource.created_by_user_photo}
              imageClassName="mt-3 ml-3 h-16 w-16"
              />
          </div>
          <div className="pt-4 flex min-h-[5rem] pb-4 bg-white-200" key={resource.id}>
              <PostText resource={resource} maxCharacteres={500}/>
          </div>
    
          {resource?.has_post_media ? (
              <div className="bg-white-200 h-4/6">
                <Posts media={resource.medias} onExpand={() => handlePostsExtend(resource)} setSlideIndex={setSlideIndex} postsSize="h-full" className="h-5/6"/>
              </div>
      ) : null}
  
          <div className="mb-5 shadow-lg">
              <PostProperies 
              object_id={resource.id}
              user_already_like={resource.user_already_like}
              quantity_comment={resource.quantity_comment} 
              quantity_likes={resource.quantity_likes}
              quantity_reposts={resource.quantity_reposts} />
          </div>
          </>
      ))}
    </>
  );
};

export default FeedComponent;

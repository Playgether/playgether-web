'use client'

import React, { useState } from "react";

import Posts from "./PostsComponents/Posts";
import PostProperies from "./PostsComponents/PostsProperies";
import { FeedProps,} from "../../../../../services/getFeed";
import PostsExtend from "../../PostsExtend/PostsExtend";
import ProfileAndUsername from "../../../../layouts/components/ProfileAndUsername";
import PostText from "../../../../layouts/PostText/PostText";
import { useFeedContext } from "../../../../../context/FeedContext";


interface ApiResponse {
  data: FeedProps[];
}

const FeedComponent = () => {
  const {feed} = useFeedContext()
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
        {feed && feed.map((resource) => (
          <React.Fragment key={resource.id}>
            <div className="bg-white-200 flex items-start justify-start">
                <ProfileAndUsername 
                username={resource.created_by_user_name}
                profile_photo={resource.created_by_user_photo}
                imageClassName="mt-3 ml-3 h-16 w-16"
                timestamp={resource.timestamp}
                />
            </div>
            <div className="pt-4 flex min-h-[5rem] pb-4 bg-white-200 cursor-pointer" 
            onClick={() => handlePostsExtend(resource)}
            >
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
          </React.Fragment>
      ))}
    </>
  );
};

export default FeedComponent;

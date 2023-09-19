import React, { useState } from "react";
import { useResource } from "../../custom_hooks/useResource";
import { getFeed } from "../../../services/getFeed";
import { FeedProps } from "../../../services/getFeed";
import { useAuthContext } from "../../../context/AuthContext";
import Posts from "./Posts";
import PostProperies from "./PostsProperies";
import ProfileImagePost from "./ProfileImagePost";
import UserNamePost from "./UserNamePost";
import PostText from "../../layouts/PostText";
import PostsExtend from "./PostsExtend";

interface ApiResponse {
  data: FeedProps[];
}

const FeedComponent = () => {
  const { user, authTokens } = useAuthContext();
  const { resources } = useResource<ApiResponse>(() => getFeed(authTokens, user?.user_id)); 
  const [openPostsExtend, setOpenPostsExtend] = useState(false)
  const [resourceState, setResourceState] = useState<FeedProps>()

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
          <PostsExtend resource={resourceState} onClose={handlePostsCloseExtend}/>
        </div>
      }
        {resources && resources.data.map((resource) => (
          <>
          <div className="bg-white-200 flex items-start justify-start">
              <ProfileImagePost link_photo={resource.created_by_user_photo} className="mt-3 ml-3 h-16 w-16"/>
              <UserNamePost username={resource.created_by_user_name}/>
          </div>
          <div className="pt-4 flex min-h-[5rem] pb-4 bg-white-200">
              <PostText resource={resource} maxCharacteres={500}/>
          </div>
    
          {resource?.has_post_media ? (
              <div className="bg-white-200 h-4/6">
                <Posts media={resource.medias} onExpand={() => handlePostsExtend(resource)}/>
              </div>
      ) : null}
  
          <div className="mb-5 shadow-lg">
              <PostProperies resource={resource}/>
          </div>
          </>
      ))}
    </>
  );
};

export default FeedComponent;

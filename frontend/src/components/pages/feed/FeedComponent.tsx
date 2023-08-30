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
import { PostsExtendProps } from "./PostsExtend";

interface ApiResponse {
  data: FeedProps[];
}

const FeedComponent = () => {
  const { user, authTokens } = useAuthContext();
  const { resources } = useResource<ApiResponse>(() => getFeed(authTokens, user?.user_id)); 
  const [openPostsExtend, setOpenPostsExtend] = useState(false)
  const [resourceState, setResourceState] = useState<PostsExtendProps>()

  const handlePostsCloseExtend = () => {
    setOpenPostsExtend(!openPostsExtend)
  }

  const handlePostsExtend = (resourceState) => {
    setResourceState(resourceState)
    setOpenPostsExtend(!openPostsExtend)
  }

  return (
      <>
        {resources && resources.data.map((resource) => (
          <>
          {openPostsExtend && 
          <div className="h-4/6">
            <PostsExtend resource={resourceState} onClose={handlePostsCloseExtend}/>
          </div>
          }
          <div className="bg-white-200 flex items-start justify-start">
              <ProfileImagePost resource={resource} />
              <UserNamePost resource={resource}/>
          </div>
          <div className="pt-4 flex min-h-[5rem] pb-4 bg-white-200">
              <PostText resource={resource} maxCharacteres={500}/>
          </div>
    
          {resource?.has_post_media ? (
              <div className="bg-white-200 h-4/6" onClick={() => handlePostsExtend(resource)}>
                <Posts media={resource.medias}/>
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

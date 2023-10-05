import { FeedProps } from "../../../services/getFeed"
import { ClosePostExpand } from "./ClosePostExpand"
import PostsExtendHasPostMedia from "./PostsExtendHasPostMedia"
import PostsExtendHasNoPostMedia from "./PostsExtendHasNoPostMedia"
import { useResource } from "../../custom_hooks/useResource"
import { PostsCommentsProps, getComments } from "../../../services/getComments"
import { useAuthContext } from "../../../context/AuthContext"
import { CommentsContextProvider } from "../../../context/CommentsContext"

export interface PostsExtendProps {
    onClose: () => void
    resource: FeedProps; 
    slideIndex: number       
} 

interface ApiResponse {
    data: PostsCommentsProps[]
}

const PostsExtend = ({onClose, resource, slideIndex}:PostsExtendProps) => {
    const { user, authTokens } = useAuthContext();
    const { resources : comments } = useResource<ApiResponse>(() => getComments(authTokens, resource?.id)); 
    return (
        <>
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[80vh] pl-10 pr-10 divide-x-2">
            {resource.has_post_media ? (
                comments ? (
                    <CommentsContextProvider>
                        <PostsExtendHasPostMedia resource={resource} slideIndex={slideIndex}/>
                    </CommentsContextProvider>
                    
                ) : null
            ):
                comments ? (

                    <PostsExtendHasNoPostMedia resource={resource} comments={comments?.data}/>

                ) : null
            }
            <ClosePostExpand onClose={onClose}/>
        </div> 
        </>
    )
}

export default PostsExtend
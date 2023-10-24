import { FeedProps } from "../../../services/getFeed"
import { ClosePostExpand } from "./ClosePostExpand"
import PostsExtendHasPostMedia from "./PostsExtendHasPostMedia"
import PostsExtendHasNoPostMedia from "./PostsExtendHasNoPostMedia"
import { PostsCommentsProps, getComments } from "../../../services/getComments"
import { CommentsContextProvider } from "../../../context/CommentsContext"
import { Suspense } from "react"
import { LoadingComments } from "../../../app/testPage/LoadingComments"

export interface PostsExtendProps {
    onClose: () => void
    resource: FeedProps; 
    slideIndex: number       
} 

interface ApiResponse {
    data: PostsCommentsProps[]
}

const PostsExtend = ({onClose, resource, slideIndex}:PostsExtendProps) => {
    
    return (
        <>
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[80vh] pl-10 pr-10 divide-x-2">
            {resource.has_post_media ? (
                <CommentsContextProvider>
                    <PostsExtendHasPostMedia resource={resource} slideIndex={slideIndex}/>
                </CommentsContextProvider>            
            ):   
                <CommentsContextProvider>
                    <PostsExtendHasNoPostMedia resource={resource}/>
                </CommentsContextProvider>
            }
            <ClosePostExpand onClose={onClose}/>
        </div> 
        </>
    )
}

export default PostsExtend
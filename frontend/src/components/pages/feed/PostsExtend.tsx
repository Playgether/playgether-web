import { FeedProps } from "../../../services/getFeed"
import { ClosePostExpand } from "./ClosePostExpand"
import PostsExtendHasPostMedia from "./PostsExtendHasPostMedia"
import PostsExtendHasNoPostMedia from "./PostsExtendHasNoPostMedia"

export interface PostsExtendProps {
    onClose: () => void
    resource: FeedProps; 
    slideIndex: number       
} 

const PostsExtend = ({onClose, resource, slideIndex}:PostsExtendProps) => {
    return (
        <>
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[80vh] pl-10 pr-10 divide-x-2">
            {resource.has_post_media ? (
                <PostsExtendHasPostMedia resource={resource} slideIndex={slideIndex}/>
            ):
                <PostsExtendHasNoPostMedia resource={resource}/>
            }
            <ClosePostExpand onClose={onClose}/>
        </div> 
        </>
    )
}

export default PostsExtend
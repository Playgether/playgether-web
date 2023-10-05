import { PostsCommentsProps } from "../../../services/getComments"
import { FeedProps } from "../../../services/getFeed"
import ProfileAndUsername from "../../layouts/components/ProfileAndUsername"
import { BorderLine } from "./BorderLine"
import CommentInput from "./CommentInput"
import CommentSectionLogic from "./CommentsSectionLogic"
import { PostTextPostExpand } from "./PostTextPostExpand"
import { SlidePostExpand } from "./SlidePostExpand"
import { useCommentsContext } from "../../../context/CommentsContext"

interface PostsExtendHasPostMediaProps {
    resource: FeedProps
    slideIndex: number
    // comments: PostsCommentsProps[]
}

const PostsExtendHasPostMedia = ({resource, slideIndex}: PostsExtendHasPostMediaProps) => {
    const {comments, fetchComments} = useCommentsContext()
    fetchComments(resource.id)
    return(
        <>
        <SlidePostExpand medias={resource.medias} slideIndex={slideIndex}/>
        <div className=" text-black-300 bg-white-300 w-full overflow-y-auto overflow-x-hidden h-full flex-1">
            <ProfileAndUsername profile_photo={resource.created_by_user_photo} username={resource.created_by_user_name} timestamp={resource.timestamp} imageClassName="mt-3 ml-3 h-16 w-16"/>
            <BorderLine/>
            <PostTextPostExpand text={resource.comment}/>
            <div className="pt-8 w-full h-4/6">
                <CommentSectionLogic resource={comments.data} />
                <CommentInput id={resource.id}/>
            </div>
        </div>
        </>
    )
}

export default PostsExtendHasPostMedia
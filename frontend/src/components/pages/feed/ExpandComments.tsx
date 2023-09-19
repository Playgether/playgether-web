import ProfileAndUsername from "../../layouts/components/ProfileAndUsername"
import PostPropertiersPostsExpand from "./PostPropertiers"
import { PostCommentsOfComments } from "../../../services/getFeed"

interface expandedCommentsProps {
    comment_of_comment: PostCommentsOfComments
}

export const ExpandedComments = ({comment_of_comment}: expandedCommentsProps) => {
    return (
        <div key={comment_of_comment.id} className="mb-4 w-full">
            <div className="flex flex-row justify-between">
                <ProfileAndUsername username={comment_of_comment.created_by_user_name} profile_photo={comment_of_comment.created_by_user_photo} imageClassName="h-6 w-6"/>
                <PostPropertiersPostsExpand quantity_comment={comment_of_comment.quantity_comment} quantity_likes={comment_of_comment.quantity_likes} />
            </div>
            <div className="flex flex-row justify-between gap-2 pt-2">
                <div className="break-all lg:text-sm xl:text-sm">
                    <p>{comment_of_comment.comment}</p> 
                </div>
            </div>
            <div className="border-b w-full border-b-gray-300 pt-2"></div>
        </div>
    )
}
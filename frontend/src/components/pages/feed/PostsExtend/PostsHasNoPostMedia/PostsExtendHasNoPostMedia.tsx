import { useCommentsContext } from "../../../../../context/CommentsContext"
import { PostsCommentsProps } from "../../../../../services/getComments"
import { FeedProps } from "../../../../../services/getFeed"
import ProfileAndUsername from "../../../../layouts/components/ProfileAndUsername"
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine"
import CommentInput from "../../DesktopFeed/MultUseComponents/CommentInput"
import CommentSectionLogic from "../CommentsSection/CommentsSectionLogic"
import { PostTextPostExpand } from "../PostTextPostExpand/PostTextPostExpand"
import { useResource } from "../../../../custom_hooks/useResource"
import { Suspense } from "react"
import { CommentSectionFallback } from "../../../../layouts/SuspenseFallBack/CommentSectionFallback"

interface PostsExtendHasNoPostMediaProps {
    resource: FeedProps

}

const PostsExtendHasNoPostMedia = ({resource}: PostsExtendHasNoPostMediaProps) => {
    return (
        <>
        <div className="w-3/6 text-black-300 h-full bg-white-300 overflow-x-auto">
            <ProfileAndUsername profile_photo={resource.created_by_user_photo} username={resource.created_by_user_name} timestamp={resource.timestamp} imageClassName="mt-3 ml-3 h-16 w-16"/>
            <BorderLine/>
            <PostTextPostExpand text={resource.comment}/> 
        </div> 
            <div className=" text-black-300 bg-white-300 w-full overflow-y-auto overflow-x-hidden h-full flex-1">
                <div className="w-full h-4/6">
                    <BorderLine className="pt-0"/>
                    <Suspense fallback={<CommentSectionFallback/>}>
                        <CommentSectionLogic postId={resource.id} />
                    </Suspense>
                    <CommentInput id={resource.id} />
                </div>
            </div>
        </>
    )
}

export default PostsExtendHasNoPostMedia
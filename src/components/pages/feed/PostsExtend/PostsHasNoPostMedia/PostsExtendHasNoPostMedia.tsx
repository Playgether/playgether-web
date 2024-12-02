import { FeedProps } from "../../../../../services/getFeed"
import ProfileAndUsername from "../../../../layouts/components/ProfileAndUsername"
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine"
import CommentInput from "../../DesktopFeed/MultUseComponents/CommentInput/CommentInput"
import { PostTextPostExpand } from "../PostTextPostExpand/PostTextPostExpand"
import { Suspense } from "react"
import { CommentSectionFallback } from "../../../../layouts/SuspenseFallBack/CommentSectionFallback/CommentSectionFallback"
import CommentSectionFetchData from "../CommentsSection/CommentSectionFetchData/CommentSectionFetchData"

interface PostsExtendHasNoPostMediaProps {
    resource: FeedProps

}

const PostsExtendHasNoPostMedia = ({resource}: PostsExtendHasNoPostMediaProps) => {
    return (
        <>
        <div className="w-3/6 text-black-300 h-full bg-white-300 overflow-y-auto overflow-x-hidden">
            <ProfileAndUsername profile_photo={resource.created_by_user_photo} username={resource.created_by_user_name} timestamp={resource.timestamp} imageClassName="mt-3 ml-3 h-8 w-8"/>
            <BorderLine/>
            <PostTextPostExpand text={resource.comment} created_by_user_name={resource.created_by_user_name} created_by_user_photo={resource.created_by_user_photo} timestamp={resource.timestamp} showExpandButton={false}/> 
        </div> 
        <div className=" text-black-300 w-3/6 overflow-hidden bg-white-300">
            <div className="h-full w-full flex flex-col relative">
                <BorderLine/>
                <div className="w-full h-[calc(100%-80px)] overflow-y-auto overflow-x-hidden">
                    <Suspense fallback={<CommentSectionFallback/>}>
                        <CommentSectionFetchData postId={resource.id} />
                    </Suspense>
                </div>
                <CommentInput id={resource.id}/>
            </div>
        </div>
        </>
    )
}

export default PostsExtendHasNoPostMedia
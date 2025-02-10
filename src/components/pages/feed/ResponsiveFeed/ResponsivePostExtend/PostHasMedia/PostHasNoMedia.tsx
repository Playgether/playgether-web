import ProfileAndUsername from "@/components/layouts/components/ProfileAndUsername"
import { CommentSectionFallback } from "@/components/layouts/SuspenseFallBack/CommentSectionFallback/CommentSectionFallback"
import { FeedProps } from "@/services/getFeed"
import { Suspense } from "react"
import { BorderLine } from "../../../DesktopFeed/MultUseComponents/BorderLine/BorderLine"
import CommentInput from "../../../DesktopFeed/MultUseComponents/CommentInput/CommentInput"
import CommentSectionFetchData from "../../../PostsExtend/CommentsSection/CommentSectionFetchData/CommentSectionFetchData"
import { PostTextPostExpand } from "../../../PostsExtend/PostTextPostExpand/PostTextPostExpand"


interface PostsExtendHasNoPostMediaProps {
    resource: FeedProps

}

const PostHasNoMedia = ({resource}: PostsExtendHasNoPostMediaProps) => {
    return (
        <>
            <div className="w-full">
                <div className="w-full text-black-300 h-52 bg-white-300 overflow-y-auto overflow-x-hidden mt-[100px]">
                    <ProfileAndUsername profile_photo={resource.created_by_user_photo} username={resource.created_by_user_name} timestamp={resource.timestamp} imageClassName="mt-3 ml-3 h-8 w-8"/>
                    <BorderLine/>
                    <PostTextPostExpand
                    text={resource.comment} 
                    created_by_user_name={resource.created_by_user_name} 
                    created_by_user_photo={resource.created_by_user_photo} 
                    timestamp={resource.timestamp} 
                    showExpandButton={false}
                    /> 
                </div> 
                <div className=" text-black-300 w-full overflow-hidden bg-white-300">
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

            </div>
        </>
    )
}

export default PostHasNoMedia
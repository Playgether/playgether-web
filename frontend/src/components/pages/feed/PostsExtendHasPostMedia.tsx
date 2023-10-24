import { FeedProps } from "../../../services/getFeed"
import ProfileAndUsername from "../../layouts/components/ProfileAndUsername"
import { BorderLine } from "./BorderLine"
import CommentInput from "./CommentInput"
import { PostTextPostExpand } from "./PostTextPostExpand"
import { SlidePostExpand } from "./SlidePostExpand"
import { Suspense } from "react"
import { CommentSectionFallback } from "../../layouts/SuspenseFallBack/CommentSectionFallback"
import CommentSectionLogic from "./CommentsSectionLogic"


interface PostsExtendHasPostMediaProps {
    resource: FeedProps
    slideIndex: number
}

const PostsExtendHasPostMedia = ({resource, slideIndex}: PostsExtendHasPostMediaProps) => {
    return(
        <>
        <SlidePostExpand medias={resource.medias} slideIndex={slideIndex}/>
        <div className=" text-black-300 bg-white-300 w-full overflow-y-auto overflow-x-hidden h-full flex-1">
            <ProfileAndUsername profile_photo={resource.created_by_user_photo} username={resource.created_by_user_name} timestamp={resource.timestamp} imageClassName="mt-3 ml-3 h-16 w-16"/>
            <BorderLine/>
            <PostTextPostExpand text={resource.comment}/>
            <div className="pt-8 w-full h-4/6">
                <Suspense fallback={<CommentSectionFallback/>}>
                    <CommentSectionLogic postId={resource.id} />
                </Suspense>
                <CommentInput id={resource.id}/>
            </div>
        </div>
        </>
    )
}

export default PostsExtendHasPostMedia
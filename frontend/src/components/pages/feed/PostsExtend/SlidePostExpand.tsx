
import { PostMedias } from "../../../../services/getFeed"
import Posts from "../DesktopFeed/Middle/PostsComponents/Posts"

interface SlidePostExpand {
    medias: PostMedias[]
    slideIndex: number
}

export const SlidePostExpand = ({medias, slideIndex}:SlidePostExpand) => {
    return (
        <div className="w-4/6 text-black-300 h-full bg-white-300">
            <Posts media={medias} onExpand={()=> false} postsSize="h-full" slideIndex={slideIndex} className="h-full mb-2"/>
        </div>
    )
}
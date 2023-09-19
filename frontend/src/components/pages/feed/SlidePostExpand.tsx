import Posts from "./Posts"
import { PostMedias } from "../../../services/getFeed"

interface SlidePostExpand {
    medias: PostMedias[]
}

export const SlidePostExpand = ({medias}:SlidePostExpand) => {
    return (
        <div className="w-4/6 text-black-300 h-full bg-white-300">
            <Posts media={medias} onExpand={()=> false} postsSize="h-full" className="h-full mb-2"/>
        </div>
    )
}
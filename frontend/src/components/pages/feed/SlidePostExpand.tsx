import Posts from "./Posts"
import { PostMedias } from "../../../services/getFeed"

interface SlidePostExpand {
    medias: PostMedias[]
}

export const SlidePostExpand = ({medias}:SlidePostExpand) => {
    return (
        <div className="w-4/6 text-black-300 bg-red-200 h-full">
            <Posts media={medias} onExpand={()=> false}/>
        </div>
    )
}
import Posts from "./Posts"
import { FeedProps } from "../../../services/getFeed"

interface SlidePostExpand {
    medias: FeedProps['medias']
}

export const SlidePostExpand = ({medias}:SlidePostExpand) => {
    return (
        <div className="w-4/6 text-black-300 bg-red-200 h-full">
            <Posts media={medias} onExpand={()=> false}/>
        </div>
    )
}
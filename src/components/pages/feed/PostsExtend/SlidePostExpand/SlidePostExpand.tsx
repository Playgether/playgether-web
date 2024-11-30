
import { Suspense } from "react"
import { PostMedias } from "../../../../../services/getFeed"
import Posts from "../../DesktopFeed/Middle/PostsComponents/Posts/Posts"
import { VideoLoadingFallback } from "../../DesktopFeed/Middle/PostsComponents/Posts/VideoLoadingFallBack"

export interface SlidePostExpandProps {
    /** Esta prop recebe uma lista de medias do tipo "PostMedias" localizada no service "getFeed" para serem adicionadas ao slide */
    medias: PostMedias[]
    /** Esta prop recebe o número do index que você quer que o slide começe (position na ordem das medias onde o slide vai inciar) */
    slideIndex: number
}

/** Este componente é responsável por criar o slide das medias em PostsExtendHasPostMedia*/
export const SlidePostExpand = ({medias, slideIndex}:SlidePostExpandProps) => {
    return (
        <div className="2xl:w-4/6 w-3/6 text-black-300 h-full max-w-[1080px] bg-white-200">
            <Suspense fallback={<VideoLoadingFallback/>}>
                <Posts media={medias} onClick={()=> false} slideIndex={slideIndex} postHeight={600} postWidth={1080} className="max-w-[1080px] h-full"/>
            </Suspense>
        </div>
    )
}
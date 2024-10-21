
import { PostMedias } from "../../../../../services/getFeed"
import Posts from "../../DesktopFeed/Middle/PostsComponents/Posts/Posts"

export interface SlidePostExpandProps {
    /** Esta prop recebe uma lista de medias do tipo "PostMedias" localizada no service "getFeed" para serem adicionadas ao slide */
    medias: PostMedias[]
    /** Esta prop recebe o número do index que você quer que o slide começe (position na ordem das medias onde o slide vai inciar) */
    slideIndex: number
}

/** Este componente é responsável por criar o slide das medias em PostsExtendHasPostMedia*/
export const SlidePostExpand = ({medias, slideIndex}:SlidePostExpandProps) => {
    return (
        <div className="w-4/6 text-black-300 h-full bg-red-300">
            <Posts media={medias} onClick={()=> false} slideIndex={slideIndex} className="h-full"/>
        </div>
    )
}
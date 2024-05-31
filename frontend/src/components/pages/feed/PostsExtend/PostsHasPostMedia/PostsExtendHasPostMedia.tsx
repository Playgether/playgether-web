import { FeedProps } from "../../../../../services/getFeed"
import ProfileAndUsername from "../../../../layouts/components/ProfileAndUsername"
import { BorderLine } from "../../DesktopFeed/MultUseComponents/BorderLine/BorderLine"
import CommentInput from "../../DesktopFeed/MultUseComponents/CommentInput/CommentInput"
import { PostTextPostExpand } from "../PostTextPostExpand/PostTextPostExpand"
import { SlidePostExpand } from "../SlidePostExpand/SlidePostExpand"
import { Suspense } from "react"
import { CommentSectionFallback } from "../../../../layouts/SuspenseFallBack/CommentSectionFallback/CommentSectionFallback"
import CommentSectionLogic from "../CommentsSection/CommentSectionFetchData/CommentSectionFetchData"


export interface PostsExtendHasPostMediaProps {
    /** Esta prop recebe um objeto post que deve ser expandido, ou seja, um post com todas as suas propriedades */
    resource: FeedProps
    /** Esta prop recebe um número que define em que index o slide de medias deste post deve começar (Por qual position de medias) */
    slideIndex: number
}

/** Este componente é responsável por expandir um post que possui media, ele deve gerar toda a interface ao expandir o post, ou seja, o texto, as medias, os comentários, etc... 
 * Ele é o componente de mais alto nível em Ao expandir um post com media. OBS: Os comentários vão mostrar o Fallback do Suspense "Os comentários estão sendo carregados" porque
 * para mostrar os comentários é necessário fazer um fetch no backend, coisa que não estamos fazendo aqui, por isso ele exibe este fallback eterno, ademais
 * no uso do componente, ele não é em coluna e sim em linha, ou seja, a parte de comentários deveria ficar para o lado direito >> e não embaixo. Além disso, as medias também 
 * não estão aparecendo porque o Storybook não está exibindo o componente de medias por alguma razão...
 */
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
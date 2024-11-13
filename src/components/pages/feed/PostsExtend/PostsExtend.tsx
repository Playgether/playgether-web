import { FeedProps } from "../../../../services/getFeed"
import { ClosePostExpand } from "./ClosePostExpand"
import PostsExtendHasPostMedia from "./PostsHasPostMedia/PostsExtendHasPostMedia"
import PostsExtendHasNoPostMedia from "./PostsHasNoPostMedia/PostsExtendHasNoPostMedia"
import { CommentsContextProvider } from "../../../../context/CommentsContext"

export interface PostsExtendProps {
    /** Esta prop recebe uma função que retorna void, esta função diz respeito ao que você quer que aconteça quando o componente for fechado, quando o usuário clicar no "X"
     * esta função será executada. No caso do componente "FeedComponent" da página feed, ele passa função "handlePostsCloseExtend" para este componente, esta função seta
     * um "(!openPostsExtend)" para a constante "openPostsExtend", que neste caso vai estar verdadeira (este componente vai estar aberto) e quando a função for executada
     * ela sera falsa, fechando este componente
     */
    onClose: () => void
    /** Esta variavel recebe um resource do tipo FeedProps, em outras palavras, é um objeto de post, neste caso, o o objeto post que foi clicado para ser expandido. */
    resource: FeedProps; 
    /** Esta prop recebe o número do index que você quer que o slide abra, ou seja, a position no carrousel de medias que você quer que abra, neste caso, na mesma position do
     * slide que o user clicou.
      */
    slideIndex: number       
} 

/** Este é o componente responsável por gerar a página extendida de um post que foi clicado no feed(Expande o post mostrando os comentários etc).  */
const PostsExtend = ({onClose, resource, slideIndex}:PostsExtendProps) => {
    
    return (
        <>
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[80vh] pl-10 pr-10 divide-x-2">
            {resource.has_post_media ? (
                <CommentsContextProvider>
                    <PostsExtendHasPostMedia resource={resource} slideIndex={slideIndex}/>
                </CommentsContextProvider>            
            ):   
                <CommentsContextProvider>
                    <PostsExtendHasNoPostMedia resource={resource}/>
                </CommentsContextProvider>
            }
            <ClosePostExpand onClose={onClose}/>
        </div> 
        </>
    )
}

export default PostsExtend
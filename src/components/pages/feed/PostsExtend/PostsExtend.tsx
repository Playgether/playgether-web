import { FeedProps } from "../../../../services/getFeed"
import { ClosePostExpand } from "./ClosePostExpand"
import PostsExtendHasPostMedia from "./PostsHasPostMedia/PostsExtendHasPostMedia"
import PostsExtendHasNoPostMedia from "./PostsHasNoPostMedia/PostsExtendHasNoPostMedia"
import { CommentsContextProvider } from "../../../../context/CommentsContext"
import { useEffect } from "react"

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

    useEffect(() => {
        const disableScrollAndEvents = (e: Event) => e.stopPropagation(); // Impede propagação para o fundo
        const preventScroll = () => (document.body.style.overflow = 'hidden');
      
        preventScroll();
        const backdrop = document.querySelector('.backdrop');
        backdrop?.addEventListener('scroll', disableScrollAndEvents, { passive: false });
        backdrop?.addEventListener('click', disableScrollAndEvents);
      
        return () => {
          document.body.style.overflow = 'auto';
          backdrop?.removeEventListener('scroll', disableScrollAndEvents);
          backdrop?.removeEventListener('click', disableScrollAndEvents);
        };
      }, []);
      
    
      return (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50" 
            onClick={onClose} 
          />
          <div 
            className="fixed z-50 flex left-0 right-0 justify-center bottom-[65px] mx-auto w-full bg-white shadow-lg bg-black-300 bg-opacity-50"
            style={{ height: 'calc(100vh - 65px)' }}
          >
            <div
                className="flex w-11/12 bg-white shadow-lg mt-[60px] mb-[20px] gap-[2px]"
                // style={{ height: 'calc(100% - 60px)' }}
            >
                {resource.has_post_media ? (
                <CommentsContextProvider>
                    <PostsExtendHasPostMedia resource={resource} slideIndex={slideIndex} />
                </CommentsContextProvider>
                ) : (
                <CommentsContextProvider>
                    <PostsExtendHasNoPostMedia resource={resource} />
                </CommentsContextProvider>
                )}
                <ClosePostExpand onClose={onClose} />
            </div>
          </div>
        </>
      );
      
}

export default PostsExtend
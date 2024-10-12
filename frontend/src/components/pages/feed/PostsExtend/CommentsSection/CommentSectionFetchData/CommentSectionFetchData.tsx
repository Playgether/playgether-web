import { useCommentsContext } from "../../../../../../context/CommentsContext"
import  CommentsSection  from "../CommentsSectionLogic/CommentsSectionLogic"


async function fetchData (postId) {
   const {fetchComments} = useCommentsContext()
   await fetchComments(postId)
}

export interface CommentSectionLogicInterface {
    /**  Esta prop recebe o número do post em que você quer dar o get nos comentários */ 
    postId: number
}

/** Este componente é responsável apenas por acionar a função "fetchComments" em "useCommentsContext". Seu intuito é servir como uma função assíncrona que espera os comentários
 * serem carregados para só depois mostras a aba de comentários, o seu return é o próprio CommentsSection, ele é apenas para servir como uma função assíncrona que espera a 
 * requisição afim de ser possível ver o fallback do Suspense. Neste caso CommentsSection esta retornando o componente "NoCommentsYet" porque nós não estamos fazendo uma 
 * para o backend."
 */
const CommentSectionFetchData = async ({postId}:CommentSectionLogicInterface) => {
    await fetchData(postId)

    return <> <CommentsSection /> </>
    
}

export default CommentSectionFetchData
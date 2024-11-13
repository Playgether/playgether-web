import { CommentContentType } from "../../../../../content_types/CommentContentType"
import FormComment from "../../../../../layouts/Forms/FormComment/FormComment"

export interface CommentProps {
    /** Este prop recebe o id do que esta sendo comentado, e este id é repassado para os componentes filhos, para que o comentário seja adicionado corretamente. */
    id: number
}

/** Este componente é o componente mais alto nível da aba de adição de comentários, ele implementa FormComment, que por sua vez, implementa FormCommentImplementation, ou seja
 * ele é o componente principal nesta árvore de componentes OBS: Perceba que todos os componentes citados são uma árvore de componentes para gerar adição de comentários, por
 * isso eles possuem retornos parecidos, não é diferente com este aqui.
 */
const CommentInput = ({id}: CommentProps) => {
    return (
        <div className="container w-full h-18 sticky bottom-0">
            <FormComment content_type={CommentContentType.post} object_id={id}/>
        </div>
    )
}

export default CommentInput
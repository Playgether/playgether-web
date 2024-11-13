import { HTMLAttributes} from "react"
import { AiTwotoneEdit } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { twJoin } from "tailwind-merge"



export interface EditCommentItensProps extends HTMLAttributes<HTMLDivElement> {
    /** Esta prop recebe uma função que dita o que deve ser feito ao clicar no ícone de editar */
    onClickEdit: () => void
    /** Esta prop recebe uma função que dita o que deve ser feito ao clicar no ícone de excluir */
    onClickDelete: () => void
}

/** Este é o componente responsável por criar os ícones de edição de comentários. Ele também pode receber um className para estilos adicionais */
export const EditCommentItens = ({onClickEdit, onClickDelete, ...rest}:EditCommentItensProps) => {
    return (
        <div 
        {...rest}
        className={twJoin("flex gap-2 w-full cursor-pointer", rest.className)}>
            <AiTwotoneEdit onClick={onClickEdit}/>
            <MdDelete onClick={onClickDelete}/>
        </div>
    )
}
import { HTMLAttributes, useState } from "react"
import { AiTwotoneEdit } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { twJoin } from "tailwind-merge"



interface EditCommentItensProps extends HTMLAttributes<HTMLDivElement> {
    onClickEdit: () => void
    onClickDelete: () => void
}




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
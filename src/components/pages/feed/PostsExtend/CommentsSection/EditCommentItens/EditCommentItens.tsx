import { HTMLAttributes } from "react";
import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { twJoin } from "tailwind-merge";

export interface EditCommentItensProps extends HTMLAttributes<HTMLDivElement> {
  /** Esta prop recebe uma função que dita o que deve ser feito ao clicar no ícone de editar */
  onClickEdit: () => void;
  /** Esta prop recebe uma função que dita o que deve ser feito ao clicar no ícone de excluir */
  onClickDelete: () => void;
}

/** Este é o componente responsável por criar os ícones de edição de comentários. Ele também pode receber um className para estilos adicionais */
export const EditCommentItens = ({
  onClickEdit,
  onClickDelete,
  ...rest
}: EditCommentItensProps) => {
  return (
    <div
      {...rest}
      className={twJoin("flex gap-2 w-full cursor-pointer", rest.className)}
    >
      <FaEdit onClick={onClickEdit} className="w-4 EditCommentsItens-edit" />
      <FaTrash
        onClick={onClickDelete}
        className="w-3 EditCommentsItens-trash"
      />
    </div>
  );
};

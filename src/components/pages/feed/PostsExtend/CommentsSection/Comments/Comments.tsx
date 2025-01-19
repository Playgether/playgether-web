"use client";

import { useState } from "react";
import EditComment from "../EditComment/EditComment";
import TextAreaLayout from "../../../../../layouts/TextAreaLayout/TextAreaLayout";
import { ErrosInput } from "../../../../../layouts/ErrosInputLayout/ErrorsInputLayout";
import DefaultButton from "../../../../../elements/DefaultButton/DefaultButton";
import { SubmitingForm } from "../../../../../layouts/SubmitingFormLayout";
import { patchComment } from "../../../../../../services/patchComment";
import { useAuthContext } from "../../../../../../context/AuthContext";
import { useCommentFormSchema } from "../../../../../layouts/Forms/CommentFormSchema";
import { UseFormState } from "../../../../../layouts/ConstFormStateLayout";
import { commentPatchProps } from "../../../../../../services/patchComment";
import { AnswerComment } from "../AnswerComment/AnswerComment";
import { PostsCommentsProps } from "../../../../../../services/getComments";
import { useCommentsContext } from "../../../../../../context/CommentsContext";
import { BorderLine } from "../../../DesktopFeed/MultUseComponents/BorderLine/BorderLine";

export interface CommentsProps {
  /** Esta prop recebe um comentário específico que é do tipo PostsCommentsProps */
  item: PostsCommentsProps;

  post_id: number; // id do post ao qual o comentário pertence (é necessário para fazer a subtrair a quantidade de comentários de um post após a exclusão de um comentário)
}

/** Este componente é responsável por gerar toda a aba de cada comentário em PostExtend, tanto a parte do comentário em sí quanto a parte de responder cada comentário.
 * PostExtend por sua vez, pega um componente e faz um loop em cada comentário deste componente, e então, passa para este componente.
 */
export const Comments = ({ item, post_id }: CommentsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { authTokens } = useAuthContext();
  const CommentFormSchema = useCommentFormSchema();
  const { register, handleSubmit, errors } = UseFormState(CommentFormSchema);
  const { editComment } = useCommentsContext();

  const handleEditClick = (value: boolean) => {
    setIsEditing(value);
  };

  const Submiting = async (data: commentPatchProps) => {
    const updatedData = { ...data, edited: true };

    const response = await SubmitingForm(() =>
      patchComment(updatedData, authTokens, item.id)
    );
    editComment(response.data);

    setIsEditing(false);
  };

  return (
    <>
      <div className="w-full flex justify-between pr-4 pl-1 pt-1 gap-2">
        {isEditing ? (
          <div className="w-full">
            <div className="cursor-pointer w-full pl-5">
              <form onSubmit={handleSubmit(Submiting)}>
                <div className="flex h-full w-full ">
                  <TextAreaLayout
                    autoFocus
                    register={{ ...register("comment") }}
                    placeholder="Edite o comentário"
                    className="h-full w-full mb-3"
                    textAreaClassName="resize-none AnswerComment-text-area"
                    defaultValue={item.comment}
                    maxRows={10}
                  />
                  <ErrosInput field={errors.comment} />
                </div>
                <div className="flex gap-2">
                  <DefaultButton className="h-10 w-20 Comments-edit-button">
                    Editar
                  </DefaultButton>
                  <DefaultButton
                    className="h-10 w-20 Comments-cancel-button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </DefaultButton>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="w-full">
            <p className="whitespace-pre-wrap" key={item.id}>
              {item.comment}
            </p>
          </div>
        )}
      </div>
      <div className="flex flex-col w-full -ml-5 mt-3 items-center justify-center gap-4">
        <EditComment
          post_id={post_id}
          Comment={item}
          handleEditClick={handleEditClick}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          className="ml-4 pb-4"
        />
      </div>
      <AnswerComment object_id={item.id} />
      <BorderLine className="Comments-border-line w-full pt-2 pl-1" />
    </>
  );
};

"use client";

import {} from "../../../../../../context/AuthContext";
import { useState } from "react";
import DefaultButton from "../../../../../elements/DefaultButton/DefaultButton";
import ControlledModal from "../../../../../elements/ControlledModal/ControlledModal";
import ButtonClose from "../../../../../elements/ButtonClose/ButtonClose";
import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";
import { commentProps } from "../../../../../../services/postComment";
import { RiDeleteBin6Line } from "react-icons/ri";
import { EditCommentItens } from "../EditCommentItens/EditCommentItens";
import { deleteComment } from "../../../../../../services/deleteComment";
import { useCommentsContext } from "../../../../../../context/CommentsContext";
import { twJoin } from "tailwind-merge";
import { HtmlHTMLAttributes } from "react";
import { useFeedContext } from "../../../../../../context/FeedContext";

interface EditCommentProps extends commentProps {
  id: number;
}

interface RestProps extends HtmlHTMLAttributes<HTMLDivElement> {}

/** Este é o componente responsável por criar a parte de edição de um comentário existente */
const EditComment = ({
  Comment,
  handleEditClick,
  isEditing,
  setIsEditing,
  post_id,
  ...rest
}: {
  post_id: number;
  Comment: EditCommentProps;
  handleEditClick: (value: boolean) => void;
  isEditing: boolean;
  setIsEditing: (boolean) => void;
} & RestProps) => {
  // const { user, authTokens } = ();
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const { deleteCommentContext } = useCommentsContext();
  const { subtractCommentQuantity } = useFeedContext();

  return (
    <>
      {/* {Comment.user === user?.user_id ? ( */}
      <div className=" w-full -mr-5 h-auto">
        <EditCommentItens
          onClickEdit={() => {
            setShouldShowModal(false);
            handleEditClick(!isEditing);
          }}
          onClickDelete={() => {
            setShouldShowModal(!shouldShowModal);
            handleEditClick(false);
          }}
          className={twJoin(rest.className)}
        />
        <ControlledModal
          shouldShow={shouldShowModal}
          onRequestClose={() => setShouldShowModal(false)}
        >
          <div className=" flex flex-col justify-center items-center gap-6 pt-2 EditComments-wrapper">
            <RiDeleteBin6Line className="h-12 w-12 text-red-400 mt-2" />
            <div className="flex flex-col text-center gap-3">
              <p className="text-lg font-medium">
                Você tem certeza que deseja excluir este comentário ?
              </p>
              <TextLimitComponent
                text={`${Comment.comment}`}
                maxCharacters={60}
              />
            </div>
            <div className="flex justify-center gap-3 pb-4">
              <ButtonClose
                className="h-8 w-20 cursor-pointer "
                onClick={async () => {
                  // try {
                  //   await deleteComment(authTokens, Comment.id);
                  //   deleteCommentContext(Comment);
                  //   subtractCommentQuantity(post_id);
                  //   setIsEditing(false);
                  // } catch (error) {
                  //   console.log(error);
                  // }
                }}
              >
                Excluir
              </ButtonClose>
              <DefaultButton
                className="h-8 w-20 Comments-cancel-button"
                onClick={() => setShouldShowModal(false)}
              >
                Cancelar
              </DefaultButton>
            </div>
          </div>
        </ControlledModal>
      </div>
      {/* ) : null} */}
    </>
  );
};

export default EditComment;

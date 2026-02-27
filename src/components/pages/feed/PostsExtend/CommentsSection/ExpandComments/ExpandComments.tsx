import { useState } from "react";
import {
  PostCommentsOfCommentsProps,
  PostsCommentsProps,
} from "../../../../../../services/getComments";
import ProfileAndUsername from "../../../../../layouts/components/ProfileAndUsername";
import PostPropertiersPostsExpand from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiers";
import PostPropertiersAnswer from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiersAnswer";
import EditComment from "../EditComment/EditComment";
import {} from "../../../../../../context/AuthContext";
import { useCommentFormSchema } from "../../../../../layouts/Forms/CommentFormSchema";
import { UseFormState } from "../../../../../layouts/ConstFormStateLayout";
import { useCommentsContext } from "../../../../../../context/CommentsContext";
import {
  commentPatchProps,
  patchComment,
} from "../../../../../../services/patchComment";
import { SubmitingForm } from "../../../../../layouts/SubmitingFormLayout";
import TextAreaLayout from "../../../../../layouts/TextAreaLayout/TextAreaLayout";
import { ErrosInput } from "../../../../../layouts/ErrosInputLayout/ErrorsInputLayout";
import DefaultButton from "../../../../../elements/DefaultButton/DefaultButton";
import EditAnswer from "../EditAnswer/EditAnswer";
import EditedComment from "../EditedComment/EditedComment";

export interface ExpandedCommentsProps {
  /** Esta prop recebe alguma resposta de algum comentário, e então, este componente gera esta resposta */
  answer: PostsCommentsProps;
  /** Esta prop recebe o id do comentário original que esta resposta pertence */
  comment_id: number;
}

/** Este componente é responsável por gerar cada resposta de cada comentário */
export const ExpandedComments = ({
  answer,
  comment_id,
}: ExpandedCommentsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // const { authTokens } = ();
  const CommentFormSchema = useCommentFormSchema();
  const { register, handleSubmit, errors } = UseFormState(CommentFormSchema);
  const { editComment, editAnswerComment } = useCommentsContext();

  const handleEditClick = (value: boolean) => {
    setIsEditing(value);
  };

  const Submiting = async (data: commentPatchProps) => {
    const updatedData = { ...data, edited: true };
    const response = await SubmitingForm(() =>
      patchComment(updatedData, "" as any, answer.id),
    );
    editComment(response.data);
    editAnswerComment(comment_id, answer.id, response.data);
    setIsEditing(false);
  };
  return (
    <>
      <div key={answer.id} className="mb-4 w-full">
        <div className="flex justify-between w-full">
          <div className="w-full space-y-1">
            <ProfileAndUsername
              username={answer.created_by_user_name}
              profile_photo={answer.created_by_user_photo}
              timestamp={answer.timestamp}
              className="w-full"
              usernameAndTimestampDiv="w-full flex flex-row justify-between pr-4"
              imageClassName="h-6 w-6"
            />
            {answer.edited === true ? <EditedComment /> : null}
          </div>
          <PostPropertiersAnswer
            object_id={answer.id}
            quantity_likes={answer.quantity_likes}
            user_already_like={answer.user_already_like}
          />
        </div>
        <div className="flex flex-row justify-between gap-2 pt-2">
          {isEditing ? (
            <div className="w-full EditComments-wrapper">
              <div className="cursor-pointer w-full pl-5">
                <form onSubmit={handleSubmit(Submiting)}>
                  <div className="flex h-full w-full ">
                    <TextAreaLayout
                      autoFocus
                      register={{ ...register("comment") }}
                      placeholder="Edite o comentário"
                      className="h-full w-full mb-3"
                      textAreaClassName="resize-none AnswerComment-text-area"
                      defaultValue={answer.comment}
                      maxRows={10}
                    />
                    <ErrosInput field={errors.comment} />
                  </div>
                  <div className="flex gap-2">
                    <DefaultButton className="h-10 w-16">Editar</DefaultButton>
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
            <div className="lg:text-sm xl:text-sm">
              <p className="whitespace-pre-wrap">{answer.comment}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col w-full items-start justify-start gap-4">
          <div className="ml-0 w-full">
            <EditAnswer
              className="pt-2"
              comment_id={comment_id}
              Answer={answer}
              handleEditClick={handleEditClick}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
            />
          </div>
        </div>
        <div className="border-b w-full border-b-gray-300 pt-2"></div>
      </div>
    </>
  );
};

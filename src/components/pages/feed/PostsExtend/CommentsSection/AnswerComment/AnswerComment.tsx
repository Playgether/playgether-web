import { BsFillSendFill } from "react-icons/bs";
import TextAreaLayout from "../../../../../layouts/TextAreaLayout/TextAreaLayout";
import { useCommentFormSchema } from "../../../../../layouts/Forms/CommentFormSchema";
import { UseFormState } from "../../../../../layouts/ConstFormStateLayout";
import { useAuthContext } from "../../../../../../context/AuthContext";
import { SubmitingForm } from "../../../../../layouts/SubmitingFormLayout";
import { postComment } from "../../../../../../services/postComment";
import { ErrosInput } from "../../../../../layouts/ErrosInputLayout/ErrorsInputLayout";
import { CommentContentType } from "../../../../../content_types/CommentContentType";
import { useCommentsContext } from "../../../../../../context/CommentsContext";
import { CustomToast, CustomToaster } from "@/components/ui/customSonner";
import {
  CustomToastErrorMessages,
  CustomToastProps,
} from "@/error/custom-toaster/enum";

export type FormCommentProps = {
  /** Esta prop recebe o id do comentário que esta sendo respondido */
  object_id: number;
};

type dataProps = {
  comment: string;
};

/** Este é o componente responsável por gerar o formulário de respostas a comentários */
export const AnswerComment = ({ object_id }: FormCommentProps) => {
  const CommentFormSchema = useCommentFormSchema();
  const { register, handleSubmit, errors, reset } =
    UseFormState(CommentFormSchema);
  const { user, authTokens } = useAuthContext();
  const { addAnswerComment } = useCommentsContext();

  const Submiting = async (data: dataProps) => {
    const newData = {
      content_type: CommentContentType.comment,
      object_id: object_id,
      user: user?.user_id,
      ...data,
    };

    const response = await SubmitingForm(() =>
      postComment(newData, authTokens)
    );
    if (response.status === 201) {
      addAnswerComment(object_id, response.data);
      reset({ comment: "" });
    } else {
      CustomToast.error(CustomToastErrorMessages.defaultTitle, {
        description: CustomToastErrorMessages.commentErrorMessage,
        duration: CustomToastProps.defaultDuration,
      });
      console.error("Algo deu errado", response);
    }
  };

  return (
    <>
      <CustomToaster />
      <form className="w-full" onSubmit={handleSubmit(Submiting)}>
        <div className="w-full flex pt-4 pl-1 -ml-2 items-end relative AnswerComment-wrapper">
          <TextAreaLayout
            register={{ ...register("comment") }}
            placeholder="Responder"
            className="w-full"
            textAreaClassName="resize-none AnswerComment-text-area"
            maxRows={15}
          />
          <button className="pl-2 rounded mb-2" type="submit">
            <BsFillSendFill className="h-6 w-8 cursor-pointer" type="submit" />
          </button>
        </div>
        {errors ? (
          <ErrosInput
            field={errors.comment}
            className="pt-4 flex items-center justify-center"
          />
        ) : null}
      </form>
    </>
  );
};

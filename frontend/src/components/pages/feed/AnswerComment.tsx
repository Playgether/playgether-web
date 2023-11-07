import { BsFillSendFill } from "react-icons/bs"
import TextAreaLayout from "../../layouts/TextAreaLayout"
import { useCommentFormSchema } from "../../layouts/Forms/CommentFormSchema"
import { UseFormState } from "../../layouts/ConstFormStateLayout"
import { useAuthContext } from "../../../context/AuthContext"
import { SubmitingForm } from "../../layouts/SubmitingFormLayout"
import { postComment } from "../../../services/postComment"
import { ErrosInput } from "../../layouts/ErrorsInputLayout"
import { CommentContentType } from "../../content_types/CommentContentType"
import { useCommentsContext } from "../../../context/CommentsContext"


type FormCommentProps = {
    object_id: number,
}

type dataProps = {
    comment: string
}

export const AnswerComment = ({object_id}: FormCommentProps) => {

    const CommentFormSchema = useCommentFormSchema()
    const {register, handleSubmit, errors, reset } = UseFormState(CommentFormSchema);
    const {user, authTokens} = useAuthContext()
    const {addAnswerComment} = useCommentsContext()

    const Submiting = async (data: dataProps) => {
        const newData = {
            content_type: CommentContentType.comment,
            object_id: object_id,
            user: user?.user_id,
            ...data
        };
        try {
            const response = await SubmitingForm(() => postComment(newData, authTokens));
            addAnswerComment(object_id, response)
            reset({comment: ''})
        } catch (error) {
            console.error('Algo deu errado', error)
        }

    }

    return (
        <form
        className="w-full"
        onSubmit={handleSubmit(Submiting)}
        >
        <div className="w-full flex pt-4 pl-1 -ml-2 items-end relative">
            <TextAreaLayout
            register= {{...register('comment')}} 
            placeholder="Responder" 
            className="w-full"
            textAreaClassName="resize-none"
            maxRows={15}/>
            <button className="pl-2 rounded mb-2" type="submit">
                <BsFillSendFill className="h-6 w-8 text-orange-400 cursor-pointer" type="submit"/>
            </button>
        </div>
        {errors ? (
                <ErrosInput
                field={errors.comment}
                className="pt-4 flex items-center justify-center"
                />
            ): null}
        </form>
    )
}
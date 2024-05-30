'use client'

import { UseFormState } from "../ConstFormStateLayout"
import { SubmitingForm } from "../SubmitingFormLayout";
import { useCommentFormSchema } from "./CommentFormSchema"
import { postComment } from "../../../services/postComment";
import { useState } from "react";
import { FormCommentImplementation } from "./FormCommentImplementation/FormCommentImplementation";
import { useAuthContext } from "../../../context/AuthContext";
import { useCommentsContext } from "../../../context/CommentsContext";

type FormCommentProps = {
    content_type: string,
    object_id: number,
}

type dataProps = {
    comment: string
}

const FormComment = ({content_type, object_id} : FormCommentProps) => {
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors, reset} = UseFormState(CommentFormSchema);
    const [success, setSuccess] = useState('')
    const { user, authTokens } = useAuthContext();
    const {addNewComment} = useCommentsContext()

    const Submiting = async (data: dataProps) => {
        const newData = {
            content_type: content_type,
            object_id: object_id,
            user: user?.user_id,
            ...data
        };
        try {
            const response = await SubmitingForm(() => postComment(newData, authTokens));
            addNewComment(response);
            setSuccess('Comentário realizado com sucesso');
            reset({comment: ''});
        } catch (error) {
            console.error('Erro ao buscar comentários:', error);
        }
    }

return (
  
    <FormCommentImplementation 
    handleSubmit={handleSubmit}
    register={register}
    Submiting={Submiting}
    errors={errors}
    />

)}

export default FormComment;
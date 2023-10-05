'use client'

import { UseFormState } from "../ConstFormStateLayout"
import { SubmitingForm } from "../SubmitingFormLayout";
import { useCommentFormSchema } from "./CommentFormSchema"
import { postComment } from "../../../services/postComment";
import { useState } from "react";
import { FormCommentImplementation } from "./FormCommentImplementation";
import { useAuthContext } from "../../../context/AuthContext";
import { useCommentsContext } from "../../../context/CommentsContext";
import { useResource } from "../../custom_hooks/useResource";
import { PostsCommentsProps } from "../../../services/getComments";

type FormCommentProps = {
    content_type: string,
    object_id: number,
}

type dataProps = {
    comment: string
}

const FormComment = ({content_type, object_id} : FormCommentProps) => {
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors } = UseFormState(CommentFormSchema);
    const [success, setSuccess] = useState('')
    const { user, authTokens } = useAuthContext();
    const {fetchComments} = useCommentsContext()

    const Submiting = (data: dataProps) => {
        const newData = {
            content_type: content_type,
            object_id: object_id,
            user: user?.user_id,
            ...data
        };
        SubmitingForm(() => postComment(newData, authTokens))
        .then(()=> {
            fetchComments(object_id)
        }).catch((error)=> {
            console.error('Erro ao buscar comentários:', error)
        });
        fetchComments(object_id)
        setSuccess('Comentário realizado com sucesso')
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
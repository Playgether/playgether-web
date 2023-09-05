'use client'

import { UseFormState } from "../ConstFormStateLayout"
import { zInferForm } from "../FormTypeLayout"
import { SubmitingForm } from "../SubmitingFormLayout";
import { useCommentFormSchema } from "./CommentFormSchema"
import { postComment } from "../../../services/postComment";
import { useState } from "react";
import { FormCommentImplementation } from "./FormCommentImplementation";



const FormComment = () => {
    const CommentFormSchema = useCommentFormSchema();
    const CommentFormData = zInferForm(CommentFormSchema);
    const {register, handleSubmit, errors } = UseFormState(CommentFormData, CommentFormSchema);
    const [success, setSuccess] = useState('')

    const Submiting = (data: typeof CommentFormData) => {
        SubmitingForm(data, postComment)
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
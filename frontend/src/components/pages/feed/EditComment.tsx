'use client'

import { AiTwotoneEdit } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { useAuthContext } from "../../../context/AuthContext";
import { patchComment } from "../../../services/patchComment";
import { TokenData } from "../../../services/updateTokenRequest";
import { useState } from "react";
import TextAreaLayout from "../../layouts/TextAreaLayout";
import { useCommentFormSchema } from "../../layouts/Forms/CommentFormSchema";
import { zInferForm } from "../../layouts/FormTypeLayout";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { SubmitingForm } from "../../layouts/SubmitingFormLayout";
import OrangeButton from "../../elements/OrangeButton";

const EditComment = ({idUser, idComment}:{idUser: number, idComment: number}) => {
    const { user, authTokens } = useAuthContext();
    const [openForm, setOpenForm] = useState(false)
    const CommentFormSchema = useCommentFormSchema();
    const CommentFormData = zInferForm(CommentFormSchema);
    const {register, handleSubmit, errors } = UseFormState(CommentFormData, CommentFormSchema);


    
    const Submiting = async (data) => {
        await SubmitingForm(() => patchComment(data, authTokens, idComment));
    }
         

    return (
        <>
            {idUser === user?.user_id ? ( 
            <div className="flex gap-3 cursor-pointer">
                <AiTwotoneEdit onClick={() => setOpenForm(!openForm)}/>
                <MdDelete />
            </div>
            ): null }
            {openForm === true ? (
            <div>
                <form onSubmit={handleSubmit(Submiting)}>
                    <div className="relative flex h-full">
                        <TextAreaLayout
                            register={{...register('comment' as never)}}
                            type="text"
                            placeholder="Digite um comentário"
                            className="h-full bg-white-200 w-full pr-12"
                        />
                    </div>
                    <OrangeButton>Editar</OrangeButton>
                </form>
            </div>
            ) : null }
        </>
    )
}

export default EditComment
'use client'

import { AiTwotoneEdit } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { useAuthContext } from "../../../context/AuthContext";
import { patchComment } from "../../../services/patchComment";
import { useState } from "react";
import TextAreaLayout from "../../layouts/TextAreaLayout";
import { useCommentFormSchema } from "../../layouts/Forms/CommentFormSchema";
import { UseFormState } from "../../layouts/ConstFormStateLayout";
import { SubmitingForm } from "../../layouts/SubmitingFormLayout";
import OrangeButton from "../../elements/OrangeButton";
import { ErrosInput } from "../../layouts/ErrorsInputLayout";
import ControlledModal from "../../elements/ControlledModal";


const EditComment = ({idUser, idComment}:{idUser: number, idComment: number}) => {
    const { user, authTokens } = useAuthContext();
    const [openForm, setOpenForm] = useState(false)
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors } = UseFormState(CommentFormSchema);
    const [shouldShowModal, setShouldShowModal] = useState(false);
    
    
    const Submiting = async (data) => {
        await SubmitingForm(() => patchComment(data, authTokens, idComment));
    }
    
    console.log(errors)

    return (
        <>
            {idUser === user?.user_id ? ( 
            <div className="flex gap-3 cursor-pointer w-full">
                <AiTwotoneEdit onClick={() => setOpenForm(!openForm)}/>
                <MdDelete onClick={() => setShouldShowModal(!shouldShowModal)}/>
                <ControlledModal shouldShow={shouldShowModal} onRequestClose={()=> setShouldShowModal(false)} buttonHideChildren="Fechar">
                    <h1>TESTE</h1>
                </ControlledModal>
            </div>
            ): null }
            {openForm === true ? (
            <div>
                <form onSubmit={handleSubmit(Submiting)}>
                    <div className="relative flex h-full">
                        <TextAreaLayout
                            register = {{...register('comment')}}
                            type="text"
                            placeholder="Edite o comentário"
                            className="h-full bg-white-200 w-full pr-12"
                        />
                        <ErrosInput field={errors.comment} />
                    </div>
                    <OrangeButton>Editar</OrangeButton>
                </form>
            </div>
            ) : null }
        </>
    )
}

export default EditComment
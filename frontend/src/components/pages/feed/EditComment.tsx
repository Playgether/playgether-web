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
import ButtonClose from "../../elements/ButtonClose";
import TextLimitComponent from "../../layouts/TextLimitComponent";
import { commentProps } from "../../../services/postComment";
import { RiDeleteBin6Line } from "react-icons/ri"
import { EditCommentItens } from "./EditCommentItens";
import { deleteComment } from "../../../services/deleteComment";


const EditComment = ({Comment}:{Comment: commentProps}) => {
    const { user, authTokens } = useAuthContext();
    const [openForm, setOpenForm] = useState(false)
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors } = UseFormState(CommentFormSchema);
    const [shouldShowModal, setShouldShowModal] = useState(false);
    
    
    const Submiting = async (data) => {
        await SubmitingForm(() => patchComment(data, authTokens, Comment.id));
    }
    

    return (
        <>
            {Comment.user === user?.user_id ? ( 
            <div className=" w-full -mr-5">
                <EditCommentItens 
                onClickEdit={()=> setOpenForm(!openForm)} 
                onClickDelete={()=> setShouldShowModal(!shouldShowModal)} 
                className="ml-4 pb-2"/>
                <ControlledModal shouldShow={shouldShowModal} onRequestClose={()=> setShouldShowModal(false)}>
                   <div className=" flex flex-col justify-center items-center gap-6 pt-2">
                        <RiDeleteBin6Line className="h-12 w-12 text-red-400 mt-2" />
                        <div className="flex flex-col text-center gap-3">
                            <p className="text-lg font-medium">Você tem certeza que deseja excluir este comentário ?</p>
                            <TextLimitComponent text={`${Comment.comment}`} maxCharacters={60}/>
                        </div>
                        <div className="flex justify-center gap-3 pb-4">
                            <ButtonClose className="h-8 w-20 cursor-pointer" onClick={()=> deleteComment(authTokens, Comment.id)}>Excluir</ButtonClose>
                            <OrangeButton className="h-8 w-20 bg-gray-400 hover:bg-gray-500 cursor-pointer" onClick={() => setShouldShowModal(false)}>Cancelar</OrangeButton>
                        </div>
                   </div>
                </ControlledModal>
            </div>
            ): null }
            {openForm === true ? (
            <div className="cursor-pointer w-full pl-5">
                <form onSubmit={handleSubmit(Submiting)}>
                    <div className="flex h-full w-full ">
                        <TextAreaLayout
                            register = {{...register('comment')}}
                            type="text"
                            placeholder="Edite o comentário"
                            className="h-full bg-white-200 w-full"
                        />
                        <ErrosInput field={errors.comment} />
                    </div>
                    <OrangeButton className="bg-gray-400 h-10 w-16 hover:bg-gray-500">Editar</OrangeButton>
                </form>
            </div>
            ) : null }
        </>
    )
}

export default EditComment
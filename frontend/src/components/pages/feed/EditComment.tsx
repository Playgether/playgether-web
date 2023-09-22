'use client'

import { useAuthContext } from "../../../context/AuthContext";
import { useState } from "react";
import OrangeButton from "../../elements/OrangeButton";
import ControlledModal from "../../elements/ControlledModal";
import ButtonClose from "../../elements/ButtonClose";
import TextLimitComponent from "../../layouts/TextLimitComponent";
import { commentProps } from "../../../services/postComment";
import { RiDeleteBin6Line } from "react-icons/ri"
import { EditCommentItens } from "./EditCommentItens";
import { deleteComment } from "../../../services/deleteComment";



interface EditCommentProps extends commentProps {
    id: number,
}


const EditComment = ({Comment, handleEditClick, isEditing}:{Comment: EditCommentProps; handleEditClick:(value:boolean) => void; isEditing: boolean}) => {
    const { user, authTokens } = useAuthContext();
    const [shouldShowModal, setShouldShowModal] = useState(false);
    

    return (
        <>
            {Comment.user === user?.user_id ? ( 
            <div className=" w-full -mr-5">
                <EditCommentItens 
                onClickEdit={()=> {
                    setShouldShowModal(false)
                    handleEditClick(!isEditing)
                }}
                onClickDelete={()=> {
                    setShouldShowModal(!shouldShowModal)
                    handleEditClick(false)
                }}
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
        </>
    )
}

export default EditComment
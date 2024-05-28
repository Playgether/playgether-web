'use client'

import { useAuthContext } from "../../../../../../context/AuthContext";
import { useState } from "react";
import OrangeButton from "../../../../../elements/OrangeButton/OrangeButton";
import ControlledModal from "../../../../../elements/ControlledModal/ControlledModal";
import ButtonClose from "../../../../../elements/ButtonClose/ButtonClose";
import TextLimitComponent from "../../../../../layouts/SuspenseFallBack/TextLimitComponent/TextLimitComponent";
import { commentProps } from "../../../../../../services/postComment";
import { RiDeleteBin6Line } from "react-icons/ri"
import { EditCommentItens } from "../EditCommentItens/EditCommentItens";
import { deleteComment } from "../../../../../../services/deleteComment";
import { useCommentsContext } from "../../../../../../context/CommentsContext";



interface EditCommentProps extends commentProps {
    id: number,
}

/** Este é o componente responsável por criar a parte de edição de um comentário existente */
const EditComment = ({Comment, handleEditClick, isEditing, setIsEditing}:{Comment: EditCommentProps; handleEditClick:(value:boolean) => void; isEditing: boolean; setIsEditing:(boolean) => void}) => {
    const { user, authTokens } = useAuthContext();
    const [shouldShowModal, setShouldShowModal] = useState(false);
    const {deleteCommentContext} = useCommentsContext()
    

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
                            <ButtonClose className="h-8 w-20 cursor-pointer " onClick={async()=> {
                                try {
                                    await deleteComment(authTokens, Comment.id)
                                    deleteCommentContext(Comment)
                                    setIsEditing(false)
                                } catch (error) {
                                    console.log(error)
                                }
                            }}
                                
                            >Excluir</ButtonClose>
                            <OrangeButton className="h-8 w-20 bg-gradient-to-r bg-gray-400 from-gray-400 via-gray-500 to-gray-500 hover:bg-gray-500 cursor-pointer hover:from-gray-500 hover:via-gray-600 hover:to-gray-600" onClick={() => setShouldShowModal(false)}>Cancelar</OrangeButton>
                        </div>
                   </div>
                </ControlledModal>
            </div>
            ): null }
        </>
    )
}

export default EditComment
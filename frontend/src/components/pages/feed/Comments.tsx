'use client'

import { useState } from "react"
import { PostComments } from "../../../services/getFeed"
import EditComment from "./EditComment"
import PostPropertiersPostsExpand from "./PostPropertiers"
import TextAreaLayout from "../../layouts/TextAreaLayout"
import { ErrosInput } from "../../layouts/ErrorsInputLayout"
import OrangeButton from "../../elements/OrangeButton"
import { SubmitingForm } from "../../layouts/SubmitingFormLayout"
import { patchComment } from "../../../services/patchComment"
import { useAuthContext } from "../../../context/AuthContext"
import { useCommentFormSchema } from "../../layouts/Forms/CommentFormSchema"
import { UseFormState } from "../../layouts/ConstFormStateLayout"
import {BsFillSendFill} from "react-icons/bs"
import { commentPatchProps } from "../../../services/patchComment"
import { CommentContentType } from "../../content_types/CommentContentType"
import { AnswerComment } from "./AnswerComment"

interface CommentsProps {
    item: PostComments
}



export const Comments = ({item}: CommentsProps) => {

    const [isEditing, setIsEditing] = useState(false);
    const { authTokens } = useAuthContext();
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors } = UseFormState(CommentFormSchema)

    const handleEditClick = (value: boolean) => {
        setIsEditing(value);
    }

    const Submiting = async (data : commentPatchProps) => {
        await SubmitingForm(() => patchComment(data, authTokens, item.id));
    }
    

    return (
        <>
        <div className="w-full flex justify-between pr-4 pl-1 pt-1 gap-2">
            {isEditing ? (
                <div className="w-full">
                    <div className="cursor-pointer w-full pl-5">
                    <form onSubmit={handleSubmit(Submiting)}>
                        <div className="flex h-full w-full ">
                            <TextAreaLayout
                                autoFocus
                                register = {{...register('comment')}}
                                placeholder="Edite o comentário"
                                className="h-full bg-white-200 w-full mb-3"
                                textAreaClassName="resize-none"
                                defaultValue={item.comment}
                            />
                            <ErrosInput field={errors.comment} />
                        </div>
                    <OrangeButton className="bg-gray-400 h-10 w-16 hover:bg-gray-500">Editar</OrangeButton>
                </form>
            </div>
                </div>
            ):
                <div className="w-full">
                    <p key={item.id}>{item.comment}</p>
                </div>
            }
            <PostPropertiersPostsExpand quantity_comment={item.quantity_comment} quantity_likes={item.quantity_likes} user_already_like={item.user_already_like} object_id={item.id}/>
        </div>
        <div className="flex flex-col w-full -ml-5 mt-2 items-center justify-center gap-4">
            <EditComment Comment={item} handleEditClick={handleEditClick} isEditing={isEditing}/>
        </div>
        {/* <div className="w-full flex pt-4 pl-1 -ml-2 items-end "> */}
            {/* <TextAreaLayout 
            placeholder="Responder" 
            className="w-full"
            textAreaClassName="resize-none"
            maxRows={15}
            register={null}/>
            <div className="pl-2 rounded mb-2">
                <BsFillSendFill className="h-6 w-8 text-orange-400 cursor-pointer" />
            </div> */}
            <AnswerComment object_id={item.id}/>
        {/* </div> */}
        <div className="border-b w-full border-b-gray-300 pt-2 pl-1"></div>
        </>
    )
}
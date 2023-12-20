'use client'

import { useState } from "react"
import EditComment from "./EditComment"
import TextAreaLayout from "../../../../layouts/TextAreaLayout"
import { ErrosInput } from "../../../../layouts/ErrorsInputLayout"
import OrangeButton from "../../../../elements/OrangeButton"
import { SubmitingForm } from "../../../../layouts/SubmitingFormLayout"
import { patchComment } from "../../../../../services/patchComment"
import { useAuthContext } from "../../../../../context/AuthContext"
import { useCommentFormSchema } from "../../../../layouts/Forms/CommentFormSchema"
import { UseFormState } from "../../../../layouts/ConstFormStateLayout"
import { commentPatchProps } from "../../../../../services/patchComment"
import { AnswerComment } from "./AnswerComment"
import { PostsCommentsProps } from "../../../../../services/getComments"
import { useCommentsContext } from "../../../../../context/CommentsContext"
import PostPropertiersPostsExpand from "../../DesktopFeed/Middle/PostsComponents/PostPropertiers"

interface CommentsProps {
    item: PostsCommentsProps
}



export const Comments = ({item}: CommentsProps) => {

    const [isEditing, setIsEditing] = useState(false);
    const { authTokens } = useAuthContext();
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors } = UseFormState(CommentFormSchema)
    const {editComment} = useCommentsContext()

    const handleEditClick = (value: boolean) => {
        setIsEditing(value);
    }

    const Submiting = async (data : commentPatchProps) => {

        const response = await SubmitingForm(() => patchComment(data, authTokens, item.id));
        editComment(response.data)
        setIsEditing(false)

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
                                maxRows={10}
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
            <EditComment Comment={item} handleEditClick={handleEditClick} isEditing={isEditing} setIsEditing={setIsEditing}/>
        </div>
            <AnswerComment object_id={item.id}/>
        <div className="border-b w-full border-b-gray-300 pt-2 pl-1"></div>
        </>
    )
}
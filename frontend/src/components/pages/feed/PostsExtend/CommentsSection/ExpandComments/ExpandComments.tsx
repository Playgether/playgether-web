import { useState } from "react"
import { PostCommentsOfCommentsProps } from "../../../../../../services/getComments"
import ProfileAndUsername from "../../../../../layouts/components/ProfileAndUsername"
import PostPropertiersPostsExpand from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiers"
import PostPropertiersAnswer from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiersAnswer"
import EditComment from "../EditComment/EditComment"
import { useAuthContext } from "../../../../../../context/AuthContext"
import { useCommentFormSchema } from "../../../../../layouts/Forms/CommentFormSchema"
import { UseFormState } from "../../../../../layouts/ConstFormStateLayout"
import { useCommentsContext } from "../../../../../../context/CommentsContext"
import { commentPatchProps, patchComment } from "../../../../../../services/patchComment"
import { SubmitingForm } from "../../../../../layouts/SubmitingFormLayout"
import TextAreaLayout from "../../../../../layouts/TextAreaLayout/TextAreaLayout"
import { ErrosInput } from "../../../../../layouts/ErrosInputLayout/ErrorsInputLayout"
import OrangeButton from "../../../../../elements/OrangeButton/OrangeButton"
import EditAnswer from "../EditAnswer/EditAnswer"



export interface ExpandedCommentsProps {
    /** Esta prop recebe alguma resposta de algum comentário, e então, este componente gera esta resposta */
    comment_of_comment: PostCommentsOfCommentsProps
    /** Esta prop recebe o id do comentário original que esta resposta pertence */
    comment_id:number
}

/** Este componente é responsável por gerar cada resposta de cada comentário */
export const ExpandedComments = ({comment_of_comment, comment_id}: ExpandedCommentsProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const { authTokens } = useAuthContext();
    const CommentFormSchema = useCommentFormSchema();
    const {register, handleSubmit, errors } = UseFormState(CommentFormSchema)
    const {editComment, editAnswerComment} = useCommentsContext()

    const handleEditClick = (value: boolean) => {
        setIsEditing(value);
    }

    const Submiting = async (data : commentPatchProps) => {

        const response = await SubmitingForm(() => patchComment(data, authTokens, comment_of_comment.id));
        editComment(response.data)
        editAnswerComment(comment_id, comment_of_comment.id, response.data)
        setIsEditing(false)

    }
    return (
        <>
        <div key={comment_of_comment.id} className="mb-4 w-full">
            <div className="flex flex-row justify-between">
                <ProfileAndUsername username={comment_of_comment.created_by_user_name} profile_photo={comment_of_comment.created_by_user_photo} timestamp={comment_of_comment.timestamp} className="w-full" usernameAndTimestampDiv="w-full flex flex-row justify-between pr-4" imageClassName="h-6 w-6"/>
                <PostPropertiersAnswer object_id={comment_of_comment.id} quantity_likes={comment_of_comment.quantity_likes} user_already_like={comment_of_comment.user_already_like}/>
            </div>
            <div className="flex flex-row justify-between gap-2 pt-2">
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
                                    defaultValue={comment_of_comment.comment}
                                    maxRows={10}
                                />
                                <ErrosInput field={errors.comment} />
                            </div>
                        <div className="flex gap-2">
                            <OrangeButton className="bg-gray-400 h-10 w-16 hover:bg-gray-500">Editar</OrangeButton>
                            <OrangeButton className="h-10 w-20 bg-gradient-to-r bg-gray-400 from-gray-400 via-gray-500 to-gray-500 hover:bg-gray-500 cursor-pointer hover:from-gray-500 hover:via-gray-600 hover:to-gray-600" onClick={() => setIsEditing(false)}>Cancelar</OrangeButton>
                        </div>
                    </form>
                </div>
                    </div>
                ):
                <div className="break-all lg:text-sm xl:text-sm">
                    <p>{comment_of_comment.comment}</p> 
                </div>
                }
            </div>
          <div className="flex flex-col w-full items-start justify-start gap-4">
            <div className="ml-0 w-full">
                <EditAnswer className="pt-2" comment_id={comment_id} Answer={comment_of_comment} handleEditClick={handleEditClick} isEditing={isEditing} setIsEditing={setIsEditing}/>
            </div>
            </div>
            <div className="border-b w-full border-b-gray-300 pt-2"></div>
        </div>
        </>
    )
}
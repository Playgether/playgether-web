import { FeedProps } from "../../../services/getFeed"
import ButtonClose from "../../elements/ButtonClose"
import Posts from "./Posts"
import ProfileImagePost from "./ProfileImagePost"
import UserNamePost from "./UserNamePost"
import { PiHeartFill } from "react-icons/pi"
import { FaComment } from "react-icons/fa"
import { useState } from "react"
import FormComment from "../../layouts/Forms/FormComment"
import EditComment from "./EditComment"
import { CommentContentType } from "../../content_types/CommentContentType"
import InputLayout from "../../layouts/InputLayout"

export interface PostsExtendProps {
    onClose: () => void
    resource: FeedProps        
} 

const PostsExtend = ({onClose, resource}:PostsExtendProps) => {

    const [expandedComments, setExpandedComments] = useState({});

    const handleExpandComment = (commentId) => {
        setExpandedComments((prevExpandedComments) => ({
          ...prevExpandedComments,
          [commentId]: !prevExpandedComments[commentId],
        }));
      };



    return (
        <>
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[75vh] pl-10 pr-10 divide-x-2">
            <div className="w-4/6 text-black-300 bg-red-200 h-full">
                <Posts media={resource.medias} onExpand={()=> false}/>
            </div>
            <div className=" text-black-300 bg-white-300 w-full overflow-y-auto overflow-x-hidden h-full">
                <div className="flex items-center justify-start gap-2">
                    <ProfileImagePost link_photo={resource.created_by_user_photo} className="mt-3 ml-3 h-16 w-16"/>
                    <UserNamePost resource={resource}/>
                </div>
                <div className="border-b border-b-gray-300 pt-2"></div>
                <div className="pt-4 pl-4">
                    <p>{resource.comment}</p>
                </div> 
                <div className="pt-8 w-full h-4/6 ">
                {resource.comments.length > 0 ? (
                    resource.comments.map((item) => (
                        <div className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full pl-4" key={item.id}> 
                            <div className="w-full ">
                                <div className="w-full flex flex-row items-center justify-start gap-2 pt-4">
                                    <ProfileImagePost link_photo={item.created_by_user_photo} className="h-6 w-6" />   
                                    <UserNamePost resource={item} />                                                
                                </div>
                                <div className="w-full flex flex-col items-start justify-start text-sm">
                                    <div className="w-full flex justify-between pr-4 pl-1 pt-1">
                                        <div className=" w-full">
                                            <p key={item.id}>{item.comment}</p>
                                        </div>
                                        <div className="flex flex-row gap-2 items-start">
                                            <div className="flex justify-center gap-2 items-center">
                                            <PiHeartFill className="h-4 w-4 text-orange-500" />
                                            <p>{item.quantity_likes}</p>
                                            <FaComment className="h-4 w-4 text-orange-500" />
                                            <p>{item.quantity_comment}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col w-full -ml-5 mt-2 items-center justify-center gap-4">
                                        <EditComment Comment={item}/>
                                    </div>
                                    <div className="w-full flex pt-4 pl-1">
                                        <input placeholder="Responder" className="w-full"/>
                                    </div>
                                    <div className="border-b w-full border-b-gray-300 pt-2 pl-1"></div>
                                    <p className='text-blue-500 cursor-pointer text-xs pl-1 pt-2 h-10' onClick={() => handleExpandComment(item.id)}>{expandedComments[item.id] === true ? 'Ocultar Respostas' : 'Ver Respostas'}</p>
                                    {expandedComments[item.id] && (
                                        <div className="w-11/12 ml-auto flex flex-col items-start mb-3 bg-white-300 rounded-3xl p-4 mt-2 mr-2">
                                            {item.comments_of_comments.lenght > 0 ? (
                                                item.comments_of_comments.map((comment_of_comment) => (
                                                    <>
                                                    {expandedComments && (
                                                    <div key={comment_of_comment.id} className="mb-4 w-full">
                                                        <div className="flex flex-row justify-between">
                                                            <div className="flex flex-row gap-1 items-center">
                                                                <ProfileImagePost link_photo={comment_of_comment.created_by_user_photo} className="h-6 w-6"/>
                                                                <UserNamePost resource={comment_of_comment}/>
                                                            </div>
                                                            <div className="flex flex-row gap-2 items-center">
                                                                <PiHeartFill className="h-4 w-4 text-orange-500" />
                                                                <p>{comment_of_comment.quantity_likes}</p>
                                                                <FaComment className="h-3 w-3 text-orange-500" />
                                                                <p>{comment_of_comment.quantity_comment}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row justify-between gap-2 pt-2">
                                                            <div className="break-all lg:text-sm xl:text-sm">
                                                                <p>{comment_of_comment.comment}</p> 
                                                            </div>
                                                        </div>
                                                        <div className="border-b w-full border-b-gray-300 pt-2"></div>
                                                    </div>
                                                    )}                  
                                                    </>
                                                ))  
                                            ) : (
                                                <div>
                                                    <p>Ainda não há respostas por aqui...</p>
                                                </div>    
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white-200 flex flex-col gap-3 text-center items-center justify-center mb-5 h-full ">
                        <p className="text-lg font-medium text-black-200">Parece que ainda não há comentários por aqui...</p>
                        <p className="text-md font-small text-gray-400">Seja o primeiro a realizar um comentário abaixo</p>
                    </div>
                )}
                <div className="container w-full h-20 sticky bottom-0">
                    <FormComment content_type={CommentContentType.post} object_id={resource.id}/>
                </div>
                </div> 
            </div>
            <div className="h-10 w-10">
                <ButtonClose className="h-full w-full" onClick={onClose}>X</ButtonClose>
            </div>
        </div> 
        </>
    )
}

export default PostsExtend
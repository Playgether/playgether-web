import { forEachChild } from "typescript"
import { FeedProps } from "../../../services/getFeed"
import ButtonClose from "../../elements/ButtonClose"
import Posts from "./Posts"
import ProfileImagePost from "./ProfileImagePost"
import UserNamePost from "./UserNamePost"
import { PiHeartFill } from "react-icons/pi"
import { FaComment } from "react-icons/fa"
import { useState } from "react"

export interface PostsExtendProps {
    onClose: () => void
    resource: FeedProps        
} 

const PostsExtend = ({onClose, resource}:PostsExtendProps) => {

    const [expandedComments, setExpandedComments] = useState(false);

    const handleExpandComments = () => {
        setExpandedComments(!expandedComments);
    };


    return (
        <div className="absolute flex flex-row left-0 right-0 z-50 w-full h-[80vh] pl-10 pr-10 divide-x-2">
            <div className="w-4/6 text-black-300 bg-red-200 h-full">
                <Posts media={resource.medias} onExpand={()=> false}/>
            </div>
            <div className="flex-1 text-black-300 bg-white-300 overflow-y-auto">
                <div className="flex items-center justify-start">
                    <ProfileImagePost resource={resource} />
                    <UserNamePost resource={resource}/>
                </div>
                <div className="border-b border-b-gray-300 pt-2"></div>
                <div className="pt-4 pl-4">
                    <p>{resource.comment}</p>
                </div> 
                <div className="pt-8">
                    {resource.comments.map((item) => (
                        <div className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full" key={item.id}> 
                            <div className="w-full pl-4">
                                <div className="w-full flex flex-row items-start justify-start">
                                    <ProfileImagePost resource={item} />   
                                    <UserNamePost resource={item} />                                                
                                </div>
                                <div className="w-full flex flex-col items-start justify-start text-sm">
                                    <div className="w-full flex justify-between pr-4">
                                        <p key={item.id}>{item.comment}</p>
                                        <div className="flex flex-row gap-2 items-center">
                                            <PiHeartFill className="h-4 w-4 text-orange-500" />
                                            <p>{item.quantity_likes}</p>
                                            <FaComment className="h-3 w-3 text-orange-500" />
                                            <p>{item.quantity_comment}</p>
                                        </div>
                                    </div>
                                    <div className="w-full flex pr-4 pt-2">
                                        <p className="text-xs">Responder</p> 
                                    </div>
                                    <div className="border-b w-full border-b-gray-300 pt-2"></div>
                                    <div className="w-11/12 ml-auto flex flex-col items-start mb-3 bg-white-300 rounded-3xl p-4 mt-2 mr-2">
                                        {item.comments_of_comments.map((comment_of_comment) => (
                                            <>
                                            {expandedComments && (
                                            <div key={comment_of_comment.id} className="mb-4 w-full">
                                                <div className="flex flex-row justify-between">
                                                    <UserNamePost resource={comment_of_comment}/>
                                                    <div className="flex flex-row gap-2 items-center">
                                                        <PiHeartFill className="h-4 w-4 text-orange-500" />
                                                        <p>{comment_of_comment.quantity_likes}</p>
                                                        <FaComment className="h-3 w-3 text-orange-500" />
                                                        <p>{comment_of_comment.quantity_comment}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row justify-between gap-2">
                                                    <div className="break-all lg:text-sm xl:text-sm">
                                                        <p>{comment_of_comment.comment}</p> 
                                                    </div>
                                                </div>
                                                <div className="border-b w-full border-b-gray-300 pt-2"></div>
                                            </div>
                                            )}                  
                                            </>
                                        ))}
                                        <p className='text-black-200 cursor-pointer text-xs' onClick={() => handleExpandComments()}>{expandedComments === true ? 'Ocultar Respostas' : 'Ver Respostas'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-10 w-10">
            <ButtonClose className="h-full w-full" onClick={onClose}>X</ButtonClose>
            </div>
        </div> 
    )
}

export default PostsExtend
import { FeedProps } from "../../../services/getFeed"
import { useState } from "react"
import ProfileAndUsername from "../../layouts/components/ProfileAndUsername"
import NoHaveCommentsYet from "./NoHaveCommentsYet"
import { ClosePostExpand } from "./ClosePostExpand"
import { NoHaveAnswersYet } from "./NoHaveAnswersYet"
import { ExpandedComments } from "./ExpandComments"
import CommentInput from "./CommentInput"
import { Comments } from "./Comments"
import { PostTextPostExpand } from "./PostTextPostExpand"
import { BorderLine } from "./BorderLine"
import { SlidePostExpand } from "./SlidePostExpand"

export interface PostsExtendProps {
    onClose: () => void
    resource: FeedProps;        
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
            <SlidePostExpand medias={resource.medias}/>
            <div className=" text-black-300 bg-white-300 w-full overflow-y-auto overflow-x-hidden h-full">
                <ProfileAndUsername profile_photo={resource.created_by_user_photo} username={resource.created_by_user_name} imageClassName="mt-3 ml-3 h-16 w-16"/>
                <BorderLine/>
                <PostTextPostExpand text={resource.comment}/>
                <div className="pt-8 w-full h-4/6 ">
                {resource.comments.length > 0 ? (
                    resource.comments.map((item) => (
                        <div className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full pl-4" key={item.id}> 
                            <div className="w-full ">
                                <ProfileAndUsername className="mt-4 mb-1" profile_photo={item.created_by_user_photo} username={item.created_by_user_name} imageClassName="h-6 w-6"/>
                                <div className="w-full flex flex-col items-start justify-start text-sm">
                                    <Comments item={item}/>
                                    <p className='text-blue-500 cursor-pointer text-xs pl-1 pt-2 h-10' onClick={() => handleExpandComment(item.id)}>{expandedComments[item.id] === true ? 'Ocultar Respostas' : 'Ver Respostas'}</p>
                                    {expandedComments[item.id] && (
                                        <div className="w-11/12 ml-auto flex flex-col items-start mb-3 bg-white-300 rounded-3xl p-4 mt-2 mr-2">
                                            {item.comments_of_comments.length > 0 ? (
                                                item.comments_of_comments.map((comment_of_comment) => (
                                                    <>
                                                    {expandedComments && (
                                                    <ExpandedComments comment_of_comment={comment_of_comment}/>
                                                    )}                  
                                                    </>
                                                ))  
                                            ) : (
                                                <NoHaveAnswersYet />   
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                            </div>
                        </div>
                    ))
                ) : (
                    <NoHaveCommentsYet/>
                )}
                <CommentInput id={resource.id}/>
                </div> 
            </div>
            <ClosePostExpand onClose={onClose}/>
        </div> 
        </>
    )
}

export default PostsExtend
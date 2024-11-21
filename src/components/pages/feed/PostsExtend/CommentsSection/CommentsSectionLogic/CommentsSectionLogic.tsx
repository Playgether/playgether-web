'use client'

import { useState } from "react"
import React from "react"
import ProfileAndUsername from "../../../../../layouts/components/ProfileAndUsername"
import { Comments } from "../Comments/Comments"
import { ExpandedComments } from "../ExpandComments/ExpandComments"
import { NoHaveAnswersYet } from "../NoHaveAnswersYet/NoHaveAnswersYet"
import NoHaveCommentsYet from "../NoHaveCommentsYet/NoHaveCommentsYet"
import { useCommentsContext } from "../../../../../../context/CommentsContext"
import EditedComment from "../EditedComment/EditedComment"
import PostPropertiersPostsExpand from "../../../DesktopFeed/Middle/PostsComponents/PostPropertiers/PostPropertiers"


/** Este componente é responsável por gerar toda a lógica de exibição da seção de comentários em PostsExpand, ou seja, fazer map nos comentários, exibir os componente corretos quando não houver
 * comentários ainda, etc...
 */
const CommentsSection = ({post_id}:{post_id:number}) => {
    const [expandedComments, setExpandedComments] = useState({});
    const {comments} = useCommentsContext()


    const handleExpandComment = (commentId:number) => {
        setExpandedComments((prevExpandedComments) => ({
          ...prevExpandedComments,
          [commentId]: !prevExpandedComments[commentId],
        }));
      };
    
    return (
        <>
            {comments?.data.length > 0 ? (
                comments?.data.map((item) => (
                    <div className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full pl-4" key={item.id}> 
                        <div className="w-full">
                            <div className="w-full flex justify-between mt-4 ">
                                <div className="w-full space-y-1">
                                    <ProfileAndUsername 
                                    className="w-full " 
                                    profile_photo={item.created_by_user_photo} 
                                    username={item.created_by_user_name} 
                                    timestamp={item.timestamp} 
                                    usernameAndTimestampDiv="flex flex-row w-full justify-between pr-4"
                                    imageClassName="h-6 w-6"/>
                                    {item.edited === true ? <EditedComment/>: null}
                                </div>
                                <PostPropertiersPostsExpand 
                                quantity_comment={item.quantity_comment} 
                                quantity_likes={item.quantity_likes} 
                                user_already_like={item.user_already_like} 
                                object_id={item.id}
                                />
                            </div>
                            <div className="w-full flex flex-col items-start justify-start text-sm">
                                <Comments post_id={post_id} item={item}/>
                                <p className='text-blue-500 cursor-pointer text-xs pl-1 pt-2 h-10' onClick={() => handleExpandComment(item.id)}>{expandedComments[item.id] === true ? 'Ocultar Respostas' : 'Ver Respostas'}</p>
                                {expandedComments[item.id] && (
                                    <div className="w-11/12 ml-auto flex flex-col items-start mb-3 bg-white-300 rounded-3xl p-4 mt-2 mr-2">
                                        {item.comments_of_comments.length > 0 ? (
                                            item.comments_of_comments.map((comment_of_comment) => (
                                                <React.Fragment key={comment_of_comment.id}>
                                                    {expandedComments && (
                                                    <ExpandedComments comment_id={item.id} comment_of_comment={comment_of_comment} key={comment_of_comment.id}/>
                                                    )}                  
                                                </React.Fragment>
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
        </>
    )
}

export default CommentsSection;

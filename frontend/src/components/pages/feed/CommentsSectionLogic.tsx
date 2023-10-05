'use client'

import { Suspense, useState } from "react"
import React from "react"
import ProfileAndUsername from "../../layouts/components/ProfileAndUsername"
import { Comments } from "./Comments"
import { ExpandedComments } from "./ExpandComments"
import { NoHaveAnswersYet } from "./NoHaveAnswersYet"
import NoHaveCommentsYet from "./NoHaveCommentsYet"
import { PostsCommentsProps } from "../../../services/getComments"
import { Loading } from "../../layouts/components/Loading"

interface CommentSectionLogicProps {
    resource: PostsCommentsProps[];
}

const CommentSectionLogic = ({resource}:CommentSectionLogicProps) => {
    
    const [expandedComments, setExpandedComments] = useState({});

    const handleExpandComment = (commentId) => {
        setExpandedComments((prevExpandedComments) => ({
          ...prevExpandedComments,
          [commentId]: !prevExpandedComments[commentId],
        }));
      };
    
      
    return (
        <>
            <Suspense fallback={<Loading />}>
                {resource.length > 0 ? (
                    resource.map((item) => (
                        <div className="text-gray-500 flex flex-row bg-white-200 items-center justify-start w-full pl-4" key={item.id}> 
                            <div className="w-full ">
                                <ProfileAndUsername className="mt-4 mb-1 w-full" profile_photo={item.created_by_user_photo} username={item.created_by_user_name} timestamp={item.timestamp} usernameAndTimestampDiv="flex flex-row w-full justify-between pr-4" imageClassName="h-6 w-6"/>
                                <div className="w-full flex flex-col items-start justify-start text-sm">
                                    <Comments item={item}/>
                                    <p className='text-blue-500 cursor-pointer text-xs pl-1 pt-2 h-10' onClick={() => handleExpandComment(item.id)}>{expandedComments[item.id] === true ? 'Ocultar Respostas' : 'Ver Respostas'}</p>
                                    {expandedComments[item.id] && (
                                        <div className="w-11/12 ml-auto flex flex-col items-start mb-3 bg-white-300 rounded-3xl p-4 mt-2 mr-2">
                                            {item.comments_of_comments.length > 0 ? (
                                                item.comments_of_comments.map((comment_of_comment) => (
                                                    <React.Fragment key={comment_of_comment.id}>
                                                        {expandedComments && (
                                                        <ExpandedComments comment_of_comment={comment_of_comment} key={comment_of_comment.id}/>
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
            </Suspense>
        </>
    )
}

export default CommentSectionLogic
'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { PostsCommentsProps, getComments } from "../services/getComments";
import { useAuthContext } from "./AuthContext";
import { commentProps } from "../services/postComment";

interface ApiResponse {
    data: PostsCommentsProps[]
}

type CommentsContextProps = {
    fetchComments: (postId: number) => void
    comments: ApiResponse
    addNewComment: (newComment:PostsCommentsProps) => void
    editComment: (updatedComment:PostsCommentsProps) => void
    deleteCommentContext: (Comment:commentProps) => void
}



export const CommentsContext = createContext<CommentsContextProps>({} as CommentsContextProps)

export function CommentsContextProvider({children}:{children: ReactNode}) {
    const [comments, setComments] = useState<ApiResponse>({data :[]})
    const { authTokens } = useAuthContext();
    

    function fetchComments (postId:number) {
        useEffect(()=> {
            async function getResource (postId:number) {
                const response = await getComments(authTokens, postId)
                setComments(response)
                return response
            }
            getResource(postId)
        }, [])
    }
    
    const addNewComment = (newComment:PostsCommentsProps) => {
        setComments(prevState => {
            return {
                ...prevState,
                data: [newComment, ...prevState.data],
            }
        })
    }

    const editComment = (updatedComment:PostsCommentsProps) => {
        setComments(prevComments => {
          const updatedComments = [...prevComments.data];
          const commentIndex = updatedComments.findIndex(comment => comment.id === updatedComment.id);
      
          if (commentIndex !== -1) {
            updatedComments[commentIndex] = updatedComment;
          }
      
          return { data: updatedComments };
        });
      };
    
    const deleteCommentContext = (deleteComment:PostsCommentsProps) => {
        setComments(prevComments => {
            const deleteComments = [...prevComments.data];
            const commentIndex = deleteComments.findIndex(comment => comment.id === deleteComment.id);

            if (commentIndex !== -1){
                deleteComments.splice(commentIndex, 1)
            }
        return { data: deleteComments };
        })
    }

    return(
        <CommentsContext.Provider value={{
            comments:comments,
            deleteCommentContext,
            editComment,
            addNewComment,
            fetchComments,
        }}>
            {children}
        </CommentsContext.Provider>
    )

}

const useCommentsContext = () => {
    const context = useContext(CommentsContext)
    return context
}

export {useCommentsContext}
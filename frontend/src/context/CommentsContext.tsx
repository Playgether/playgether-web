'use client'
import { ReactNode, createContext, useContext, useEffect, useState } from "react"
import { PostCommentsOfCommentsProps, PostsCommentsProps, getComments } from "../services/getComments";
import { useAuthContext } from "./AuthContext";
import { commentProps } from "../services/postComment";

export interface ApiResponseComments {
    data: PostsCommentsProps[]
}

type CommentsContextProps = {
    fetchComments: (postId: number) => void
    comments: ApiResponseComments
    addNewComment: (newComment:PostsCommentsProps) => void
    editComment: (updatedComment:PostsCommentsProps) => void
    deleteCommentContext: (Comment:commentProps) => void
    deleteAnswerContext: (comment_id:number, answer_id:number) => void
    addAnswerComment: (objectId:number, answerComment:PostCommentsOfCommentsProps) => void
    editAnswerComment: (comment_id:number, answer_id:number, answerComment:PostCommentsOfCommentsProps) => void
}



export const CommentsContext = createContext<CommentsContextProps>({} as CommentsContextProps)

export function CommentsContextProvider({children}:{children: ReactNode}) {
    const [comments, setComments] = useState<ApiResponseComments>({data :[]})
    const { authTokens } = useAuthContext();
    

    function fetchComments (postId:number) {
        useEffect(()=> {
            async function getResource (postId:number) {
                const response = await getComments(authTokens, postId)
                if (response !== undefined) {
                    setComments(response);
                } else {
                    console.error("Erro ao buscar comentários");
                }
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

    const addAnswerComment = (objectId:number, answerComment:PostCommentsOfCommentsProps) => {
        setComments(prevComments => {
            const commentsList = prevComments.data.map(comment => {
                if (comment.id === objectId) {
                    const newComment = {
                        ...comment,
                        quantity_comment:comment.quantity_comment + 1,
                        comments_of_comments: [answerComment, ...comment.comments_of_comments],
                    };
                    return newComment

                }
                return comment;
            });
            return {
                data: commentsList
            };
        });
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

    const editAnswerComment = (comment_id:number, answer_id:number, answerComment:PostsCommentsProps) => {
        setComments(prevComments => {
            const commentsList = [...prevComments.data]
            const commentIndex = commentsList.findIndex(comment => comment.id === comment_id)

            if (commentIndex !== -1) {
               const answersComment = commentsList[commentIndex].comments_of_comments
               const answerIndex = answersComment.findIndex(answer => answer.id === answer_id)

               if (answerIndex !== -1){
                answersComment[answerIndex] = answerComment;
               }
            }
            return {data: commentsList}
        })
    }

    const deleteAnswerContext = (comment_id:number, answer_id:number) => {
        setComments(prevComments => {
            const listComments = [...prevComments.data];
            const commentIndex = listComments.findIndex(comment => comment.id === comment_id);

            if (commentIndex !== -1){
                const listAnswers = listComments[commentIndex].comments_of_comments
                const answerIndex = listAnswers.findIndex(answer => answer.id === answer_id)
                if (answerIndex !== -1){
                    listAnswers.splice(answerIndex, 1)
                    listComments[commentIndex].quantity_comment = listComments[commentIndex].quantity_comment - 1
                }
            }
        return { data: listComments };
        })
    }




    return(
        <CommentsContext.Provider value={{
            comments:comments,
            addAnswerComment,
            deleteCommentContext,
            editComment,
            addNewComment,
            fetchComments,
            editAnswerComment,
            deleteAnswerContext,
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
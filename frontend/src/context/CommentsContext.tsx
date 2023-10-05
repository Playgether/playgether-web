'use client'

import { ReactNode, createContext, useContext, useState } from "react"
import { useResource } from "../components/custom_hooks/useResource";
import { PostsCommentsProps, getComments } from "../services/getComments";
import { useAuthContext } from "./AuthContext";

interface ApiResponse {
    data: PostsCommentsProps[]
}

type CommentsContextProps = {
    fetchComments: (postId: number) => void
    comments: ApiResponse
}

export const CommentsContext = createContext<CommentsContextProps>({} as CommentsContextProps)

export function CommentsContextProvider({children}:{children: ReactNode}) {
    const [comments, setComments] = useState<ApiResponse>({data :[]})
    const { authTokens } = useAuthContext();
    

    const fetchComments = async (postId:number) => {
        const resources = await getComments(authTokens, postId); 
        setComments(resources)    
    }

    return(
        <CommentsContext.Provider value={{
            comments:comments,
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
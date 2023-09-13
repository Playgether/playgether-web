import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

interface commentProps {
    comment: string,
    user: number,
    content_type: string,
    object_id: number,
}

export const postComment = async (data: commentProps, authTokens : TokenData) => {
    try{
        await api.post('/api/v1/comments/', data, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
    } catch (error) {
        console.log(error)
    }
}
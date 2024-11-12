import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface commentProps {
    comment: string,
    user: number | undefined,
    content_type: string,
    object_id: number,
}

export const postComment = async (data: commentProps, authTokens : TokenData | null | undefined) => {
    try{
        const response = await api.post('/api/v1/comments/', data, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        return response.data
    } catch (error) {
        console.log(error)
    }
}
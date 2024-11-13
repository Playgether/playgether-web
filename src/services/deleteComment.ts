import { api } from "./api";
import { TokenData } from "./updateTokenRequest";



export const deleteComment = async (authTokens : TokenData | null | undefined, object_id: number) => {
    try{
        const response = await api.delete(`/api/v1/comments/${object_id}/`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        return response.status
    } catch (error) {
        console.log(error)
    }
}
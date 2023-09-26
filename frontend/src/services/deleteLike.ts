import { api } from "./api";
import { TokenData } from "./updateTokenRequest";


export const deleteLike = async (authTokens : TokenData | null | undefined, object_id: number) => {
    try{
        const response = await api.delete(`/api/v1/posts/${object_id}/likes`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        response.status
    } catch (error) {
        console.log(error)
    }
}
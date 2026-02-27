import { api } from "@/services/api"
import { TokenData } from "@/services/updateTokenRequest"


export interface LikeProps {
    user: number | undefined,
    content_type: string,
    object_id: number,
}

export const postLike = async (data: LikeProps, authTokens : TokenData | null | undefined) => {
    try{
        await api.post('/api/v1/likes/', data, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
    } catch (error) {
        console.log(error)
    }
}
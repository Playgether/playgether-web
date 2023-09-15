import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

interface commentPatchProps {
    comment: string
}

export const patchComment = async (data: commentPatchProps, authTokens : TokenData | null | undefined, object_id: number) => {
    try{
        const response = await api.patch(`/api/v1/comments/${object_id}/`, data, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        response.status
    } catch (error) {
        console.log(error)
    }
}
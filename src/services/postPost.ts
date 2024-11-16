import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface postPostProps {
    comment: string,
    created_by_user:number | undefined,
    has_post_media:boolean
    medias:PostMediaProps[]
}

export interface PostMediaProps {
    post:number,
    media_file:string,
    position:number,
    media_type:string,
    width:number,
    height:number,
    bytes_file:number,
    file_format:string,
    created_at:Date
    media_folder:string
}

export const postPost = async (data: postPostProps, authTokens : TokenData | null | undefined) => {
    try{
        const response = await api.post('/api/v1/posts/', data, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        return response
    } catch (error) {
        console.log(error)
    }
}
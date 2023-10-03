import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface PostComments {

    id:number;
    created_by_user_name: string;
    created_by_user_photo: string;
    user_already_like: boolean,
    object_id: number;
    comment: string;
    timestamp: number;
    quantity_comment: number;
    quantity_likes: number;
    content_type: string;
    user: number;
    comments_of_comments: PostCommentsOfComments[]
    
}

export interface PostCommentsOfComments {

    id:number;
    created_by_user_name: string;
    created_by_user_photo: string;
    object_id: number;
    comment: string;
    timestamp: number;
    quantity_comment: number;
    quantity_likes: number;
    content_type: number;
    user_already_like: boolean
    user: number;
    comments_of_comments: PostCommentsOfComments[];
    
}

export interface PostLikes {

    id:number;
    created_by_user_name: string;
    created_by_user_photo: string;
    object_id: number;
    timestamp: number;
    content_type: number;
    user:number;
    
}

export interface PostReposts {

    id: number; 
    created_by_user_name: string;
    created_by_user_photo: string;
    timestamp: number;
    object_id: number;
    content_type: number;
    user:number;
    comment: string;
    quantity_visualization: number;
    quantity_comment: number;
    quantity_likes: number;
    quantity_shares: number;
    
}

export interface PostMedias {

    id: number;
    media_file: string;
    position:number;
    media_type:string;
    post:number;
    
}

export interface FeedProps {
    created_by_user: number;
    created_by_user_name: string;
    created_by_user_photo: string;
    comments:PostComments[],
    likes: PostLikes[];
    reposts: PostReposts[];
    medias: PostMedias[];
    id: number; 
    timestamp: number;
    quantity_visualization: number;
    quantity_comment: number;
    quantity_likes: number;
    quantity_reposts: number;
    comment: string;
    has_post_media: boolean;
    link: string;
    user_already_like: boolean;
}

export const getFeed = async (authTokens : TokenData | undefined | null, userId : number | undefined) => {

    try {
        const response = await api.get<FeedProps[]>(`/api/v1/posts/${userId}/feed/`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        return response
    } catch (error) {   
        return error;
    };
   
};

  

import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface FeedProps {
    created_by_user: number;
    created_by_user_name: string;
    created_by_user_photo: string;
    comments:{
        id:number;
        created_by_user_name: string;
        created_by_user_photo: string;
        object_id: number;
        comment: string;
        timestamp: string;
        quantity_comment: number;
        quantity_likes: number;
        content_type: number;
        user: number;
        comments_of_comments:{
            id:number;
            created_by_user_name: string;
            created_by_user_photo: string;
            object_id: number;
            comment: string;
            timestamp: string;
            quantity_comment: number;
            quantity_likes: number;
            content_type: number;
            user: number;
            comments_of_comments:{};
        }
    },
    likes: {
        id:number;
        created_by_user_name: string;
        created_by_user_photo: string;
        object_id: number;
        timestamp: number;
        content_type: number;
        user:number;
    };
    reposts: {
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
    };
    medias: {
        id: number;
        media_file: string;
        position:number;
        media_type:string;
        post:number;
    };
    id: number; 
    timestamp: number;
    quantity_visualization: number;
    quantity_comment: number;
    quantity_likes: number;
    quantity_reposts: number;
    comment: string;
    has_post_media: boolean;
    link: string;
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

  

import { api } from "./api";
import { TokenData } from "./updateTokenRequest";


export interface PostLikes {

    id:number;
    created_by_user_name: string;
    created_by_user_photo: string;
    object_id: number;
    timestamp: Date;
    content_type: string;
    user:number;
    
}

export interface PostReposts {

    id: number; 
    created_by_user_name: string;
    created_by_user_photo: string;
    timestamp: Date;
    object_id: number;
    content_type: string;
    user:number;
    comment: string;
    quantity_visualization: number;
    quantity_comment: number;
    quantity_likes: number;
    quantity_shares: number;
    
}

export interface PostMedias {
    id:number
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

export interface PaginationProps {
    next:string;
    previous: string;
    results:FeedProps[];
}

export interface FeedProps {
    created_by_user: number;
    created_by_user_name: string;
    created_by_user_photo: string;
    // comments:PostComments[],
    likes: PostLikes[];
    reposts: PostReposts[];
    medias: PostMedias[];
    id: number; 
    timestamp: Date;
    quantity_visualization: number;
    quantity_comment: number;
    quantity_likes: number;
    quantity_reposts: number;
    comment: string;
    has_post_media: boolean;
    link: string;
    user_already_like: boolean;
}

export const getFeed = async (
    authTokens: TokenData | undefined | null,
    userId: number | undefined,
    pageParam: string | null = null
) => {
    try {
        const response = await api.get(`/api/v1/posts/${userId}/feed/`, {
            headers: {
                Authorization: `Bearer ${authTokens?.access}`,
            },
            params: {
                cursor: pageParam, 
            },
        });
        return {
            data: response.data.results,
            next_page: response.data.next,
        };
    } catch (error) {
        console.error("Error fetching feed:", error);
        return {
            data: [],
            next_page: null,
        };
    }
};

  

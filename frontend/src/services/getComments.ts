import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface PostsCommentsProps {

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
    comments_of_comments: PostCommentsOfCommentsProps[]
    
}

export interface PostCommentsOfCommentsProps {

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
    comments_of_comments: PostCommentsOfCommentsProps[];
    
}

export const getComments = async (authTokens : TokenData | undefined | null, postId : number | undefined) => {

    try {
        const response = await api.get<PostsCommentsProps[]>(`/api/v1/posts/${postId}/comments/`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        return response
    } catch (error) {   
        return console.log(error);
    };
   
};

// export function getComments (authTokens : TokenData | undefined | null, postId : number | undefined) {

//     let fetching =  api.get<PostsCommentsProps[]>(`/api/v1/posts/${postId}/comments/`, {
//         headers: {
//             'Authorization':'Bearer ' + String(authTokens?.access)
//         }}).then((response)=> {
//             status = "fulfilled";
//             result = response
//         }).catch((error)=> {
//             status = "rejected"
//             result = error
//         })

//     return () => {
//         if (status === "pending") {
//             throw fetching;
//         } else if (status === "rejected") {
//             throw result;
//         } else if (status === "fulfilled") {
//             return result
//         }
//     }   
// };


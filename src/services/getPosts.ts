import { api } from "./api";
import { error } from "console";

export interface PostProps {
    id: number; 
    timestamp: number;
    quantity_visualization: number;
    quantity_comment: number;
    quantity_likes: number;
    quantity_reposts: number;
    comment: string;
    has_post_media: boolean;
}

export const getPosts = async (userId) => {

    const response = await api.get<PostProps[]>(`/api/v1/users/${userId}/posts`)
    .then((response) => {;
        return response.data;
    })
    .catch((error) => {
        console.error(error);
    });
    return []
};
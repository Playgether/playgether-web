import { api } from "./api";

interface commentProps {
    comment: string
}

export const postComment = async (data: commentProps) => {
    try{
        await api.post('/api/v1/comments/', data)
    } catch (error) {
        console.log(error)
    }
}
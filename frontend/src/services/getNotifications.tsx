import { api } from "./api";
import { TokenData } from "./updateTokenRequest";
import { UserProps } from "../context/AuthContext";

export interface getNotificationsProps {
    id: number,
    is_read: boolean;
    message: string;
    timestamp: number;
    user: number;
}

export const getNotifications = async (authTokens : TokenData | null, user : UserProps | null) => {
    console.log(user?.user_id, authTokens)
    const response = await api.get(`/api/v1/users/${user?.user_id}/notifications/`, {
    headers: {
        'Authorization':'Bearer ' + String(authTokens?.access)
    }})
    .catch((error) => {
        console.log(error)
        return error
    }) 
    return response.data
     
};

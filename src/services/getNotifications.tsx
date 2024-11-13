import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface getNotificationsProps {
    id: number,
    is_read: boolean;
    message: string;
    timestamp: number;
    user: number;
    actor_profile_photo:string;
    actor_name:string;
}

export const getNotifications = async (authTokens : TokenData | null | undefined, userId : number | undefined) => {
    const response = await api.get<getNotificationsProps>(`/api/v1/users/${userId}/notifications/`, {
    headers: {
        'Authorization':'Bearer ' + String(authTokens?.access)
    }})
    .catch((error) => {
        console.log(error)
        return error
    }) 
    return response.data
     
};

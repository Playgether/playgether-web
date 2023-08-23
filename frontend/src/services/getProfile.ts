import { api } from "./api";
import { TokenData } from "./updateTokenRequest";


export interface ProfileProps {
    id: number; 
    bio: string;
    profile_photo: string;
    hours_played: number;
    matches_played: number;
    performance: string;
    gamer_nivel: number;
    verified: boolean;
}
export const getProfile = async (authTokens : TokenData | undefined | null, userId : number | undefined) => {

    try {
        const response = await api.get<ProfileProps[]>(`/api/v1/profiles/${userId}`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }})
        return response
    } catch (error) {   
        return error;
    };
   
};
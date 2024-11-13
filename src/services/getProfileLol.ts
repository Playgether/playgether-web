import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface ProfileLolProps {
    username: string;
    rank: string;
    tag: string;
    id: number; 
    account_id: string;
    puuid: string;
    summonerId: string;
}

export const getProfileLol = async (authTokens: TokenData | null | undefined, id_profile: number | undefined) => {
    try {
        const response = await api.get<ProfileLolProps[]>(`/api/v1/games/infos/lol`, {
            headers: {
                'Authorization':'Bearer ' + String(authTokens?.access)
            }
        })
        return response;   
    } catch (error) {
        console.log(error);
        return error;
    }

};
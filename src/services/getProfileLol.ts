import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface ProfileLolProps {
    username: string;
    tag: string;
    data: ProfileLolData;
}

interface ProfileLolData {
    leaguePoints: number;
    losses: number;
    queueType: string;
    rank: string;
    tier: string;
    winRate: string;
    wins: number;
}

export const getProfileLol = async (authTokens: TokenData | null | undefined, id: number | undefined) => {
    try {
        const response = await api.get<ProfileLolProps[]>(`/api/v1/profiles/${id}/games/fetch/lol`, {
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
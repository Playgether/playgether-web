import { api } from "./api";
import { TokenData } from "./updateTokenRequest";

export interface UploadPostSignature{
    upload_url: string,
    params: {
        folder: string,
        resource_type: string,
        timestamp: number,
        signature: string,
        api_key: number
        api_cloud_name:string,
    } 
}

export const getUploadPostSignature = async (authTokens:TokenData|null|undefined)=> {
    try {
        const response = await api.get<UploadPostSignature>(`api/v1/posts/signed/url`,{
            headers: {
                'Authorization':'Bearer '+ String(authTokens?.access)
            }
        })
        return response;
    } catch (err) {
        console.log(err);
        return err;
    }
}


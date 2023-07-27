import { api } from "./api";

export type TokenData = {
    access: string 
    refresh: string;
  }

export const updateTokenRequest = async (data : TokenData) => {
    const response = await api.post('/api/token/refresh/', data)
    .catch((error) => {
        console.log(error)
    }) 
    return response
     
};


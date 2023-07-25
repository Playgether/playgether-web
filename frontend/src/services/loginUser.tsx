import { api } from "./api";

export interface loginUser {
    username: string;
    password: string;
}

export const login = async (data: loginUser) => {
            
    try{
        const response = await api.post('/api/token/', data) 
        return response.data
    } catch (error) { 
        console.log(error);
    }
   
};


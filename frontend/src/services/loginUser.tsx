import { api } from "./api";

export interface loginUserProps {
    username: string;
    password: string;
}

export const loginUser = async (data: loginUserProps) => {
        
    const response = await api.post('/api/token/', data)
    .catch((error) => {
        console.log(error)
        return error
    }) 
    return response
     
};


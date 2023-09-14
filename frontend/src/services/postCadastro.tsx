
import { Schema, ZodSchema, ZodType } from "zod";
import { api } from "./api";


export interface postCadastroProps {
    first_name: string;
    username: string;
    email: string;
    password: string;
    last_name: string;
}


export const post = async (data: postCadastroProps) => {
        
        try{
            await api.post('/api/v1/users/', data)
        } catch (error) { 
            console.log(error);
        }
        

    };



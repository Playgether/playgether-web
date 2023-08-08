import { z } from 'zod';

export const LoginFormSchema = () => { 
    const LoginUserSchema = z.object({
        username: z.string()
        .nonempty('O username é obrigatório').min(6, 'O nome de usuário precisa ter no mínimo 6 caracteres').max(150, 'o nome de usuário deve ter no máximo 150 caracteres'),

        password: z.string()
        .nonempty('A senha é obrigatória').min(8, 'A senha precisa de no mínimo 8 caracteres').max(128, 'a senha deve ter no máximo 128 caracteres')
    });

    return LoginUserSchema  

}
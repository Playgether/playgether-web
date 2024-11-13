import { z } from 'zod';

export const PostFormSchema = () => {
    const PostFormSchema = z.object({
        text: z.string()
        .min(1, "O texto não pode estar vazio")
        .max(2200, "O texto pode ter no máximo 2200 caracteres")
    });

    return PostFormSchema
}
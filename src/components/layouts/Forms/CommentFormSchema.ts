import { z } from 'zod';

export const useCommentFormSchema = () => {
    const CommentFormSchema = z.object({
        comment: z.string().min(1, 'O comentário não pode estar vazio').max(2200, 'Você atingiu a quantidade máxima de caracteres'),
    })
    return CommentFormSchema
}
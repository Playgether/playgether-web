import { z } from 'zod';

export const useCommentFormSchema = () => {
    const CommentFormSchema = z.object({
        comment: z.string().nonempty('O comentário não pode estar vazio').max(2200, 'Você atingiu a quantidade máxima de caracteres'),
    })
    return CommentFormSchema
}
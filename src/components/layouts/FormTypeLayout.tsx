import { ZodType, z } from 'zod';

export const zInferForm = (Schema:ZodType<any>) => { 

    type zInferForm = z.infer<typeof Schema>

    return zInferForm

}


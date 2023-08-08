import { z } from 'zod';

export const zInferForm = (Schema) => { 

    type zInferForm = z.infer<typeof Schema>

    return zInferForm

}


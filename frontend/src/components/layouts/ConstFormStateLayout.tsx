import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodType } from 'zod';
import { z } from 'zod'


export const UseFormState =(
    Schema: ZodType<any>
  ) => {
    type FormData = z.infer<typeof Schema>
    const {
      register,
      handleSubmit,
      getValues,
      formState: { errors }
    } = useForm<FormData>({
      resolver: zodResolver(Schema)
    });
  
    return { register, handleSubmit, errors, getValues };
  };
  



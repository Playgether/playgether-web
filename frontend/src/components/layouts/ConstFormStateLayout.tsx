import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodType } from 'zod';


export const UseFormState = <T extends Record<string, any>>(
    FormData: T,
    Schema: ZodType<any>
  ) => {
    const {
      register,
      handleSubmit,
      getValues,
      formState: { errors }
    } = useForm<typeof FormData>({
      resolver: zodResolver(Schema)
    });
  
    return { register, handleSubmit, errors, getValues };
  };
  



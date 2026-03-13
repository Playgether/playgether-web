import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import { ZodType } from 'zod';
import { z } from 'zod'


export const UseFormState =(
    Schema: ZodType<any>,
    defaultValues?: Partial<z.infer<typeof Schema>>
  ) => {
    type FormData = z.infer<typeof Schema>
    const {
      register,
      handleSubmit,
      getValues,
      setValue,
      watch,
      reset,
      formState: { errors }
    } = useForm<FormData>({
      resolver: zodResolver(Schema),
      defaultValues: defaultValues as FormData
    });
  
    return { register, handleSubmit, errors, getValues, setValue, watch, reset };
  };
  



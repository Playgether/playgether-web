import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'

export const UseFormState = (FormData, Schema) => {
    const { register, 
        handleSubmit,
        getValues,
        formState: {errors} }
        = useForm<typeof FormData>({
            resolver: zodResolver(Schema)
        })

    return {register, handleSubmit, errors, getValues}
}




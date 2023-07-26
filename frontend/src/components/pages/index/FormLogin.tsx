import React, { useContext } from "react";
import Button from "../../elements/Button";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useAuthContext } from "../../../context/AuthContext";

const FormLogin = ({onClickAqui}) => {
    const [success, setSuccess] = useState('');
    const { user, login, logout } = useAuthContext();

    const LoginUserSchema = z.object({
        username: z.string()
        .nonempty('O username é obrigatório').min(6, 'O nome de usuário precisa ter no mínimo 6 caracteres').max(150, 'o nome de usuário deve ter no máximo 150 caracteres'),

        password: z.string()
        .nonempty('A senha é obrigatória').min(8, 'A senha precisa de no mínimo 8 caracteres').max(128, 'a senha deve ter no máximo 128 caracteres')
    });

    type LoginUserFormData = z.infer<typeof LoginUserSchema>

    const { register, 
        handleSubmit,
        formState: {errors} }
        = useForm<LoginUserFormData>({
            resolver: zodResolver(LoginUserSchema)
        })
   

    const Submiting = (data: LoginUserFormData) => {
        try {
          login(data);
        } catch (error) {
          console.log(error);
        }
      };

    return (
        <form onSubmit={handleSubmit(Submiting)}>
            <div className='mb-4'>
                <input type='text'
                placeholder='Username' 
                className='apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none'
                {...register('username')}></input>
                <div className="flex flex-col gap-2">
                  {errors.username && <span className="text-xs text-red-400">{errors.username.message}</span>}
                </div>
            </div>
            <div className='mb-4'>
                <input 
                type='password' 
                placeholder='Senha' 
                className='apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none'
                {...register('password')}></input>
                <div className="flex flex-col gap-2">
                  {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
                </div>
                
            </div>
            <div className='mb-4'>
                <Button
                onClick={null}
                pxValue={8}
                pyValue={4}
                extraClassName={'inline-block w-full leading-none shadow'}          
                >
                LOGAR
                </Button>
            </div>
            <div className='nb-4'>
                <p className="text-black-300">Já possui uma conta? <a href='#' onClick={onClickAqui} className='text-blue-600'>Entre aqui.</a></p>
            </div>
        </form>
    );
};

export default FormLogin

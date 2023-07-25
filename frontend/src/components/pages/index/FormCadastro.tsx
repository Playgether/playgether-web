import React from "react";
import Button from "../../elements/Button";
import { useState } from "react";
import { post } from "../../../services/postCadastro";
import { getAvailableUsernames } from "../../../services/getAvailableUsernames";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod'


const FormCadastro = ({ onClickAqui }) => {
    const [success, setSuccess] = useState('');
    const [availableUsernameResult, setAvailableUsernameResult] = useState(<span></span>);
    const createUserFormSchema = z.object({
      email: z.string()
      .nonempty('O email é obrigatório').email('Formato de e-mail inválido').max(254, 'o email só pode ter 256 caracteres'),

      password:z.string()
      .nonempty('A senha é obrigatória').min(8, 'A senha precisa de no mínimo 8 caracteres').max(128, 'a senha deve ter no máximo 128 caracteres').refine((value) => {
        const uppercaseRegex = /[A-Z]/;
        const lowercaseRegex = /[a-z]/;
        const numberRegex = /[0-9]/;
        return (
          uppercaseRegex.test(value) &&
          lowercaseRegex.test(value) &&
          numberRegex.test(value)
        );
      }, {
        message: 'A senha deve ser forte e conter pelo menos uma letra maiúscula, uma letra minúscula e um número',
      }),
      
      repeatPassword: z.string()
      .nonempty('A senha é obrigatória').min(8, 'A senha precisa de no mínimo 8 caracteres').max(128, 'a senha deve ter no máximo 128 caracteres'),

      agree: z.boolean(),

      first_name: z.string()
      .nonempty('O nome é obrigatório').min(1, 'O nome não pode estar vazio').max(150, 'O nome pode ter no máximo 150 caracteres').transform(first_name => {
        return first_name.charAt(0).toLocaleUpperCase() + first_name.slice(1).toLowerCase()
      }).refine((value) => {

        const numberRegex = /[0-9]/;
        const letterRegex = /^[a-zA-Z]+$/;
        return (
          numberRegex.test(value) == false &&
          letterRegex.test(value)
        )
        }, {
        message: 'Este campo aceita apenas letras',
      }),

      last_name: z.string()
      .min(1, "O sobrenome não pode estar vazio")
      .max(150, 'O sobrenome pode ter no máximo 150 caracteres').transform(last_name => {
        return last_name.charAt(0).toLocaleUpperCase() + last_name.slice(1).toLowerCase()
      }).refine((value) => {

        const numberRegex = /[0-9]/;
        const letterRegex = /^[a-zA-Z]+$/;
        return (
          numberRegex.test(value) == false &&
          letterRegex.test(value)
        )
        }, {
        message: 'Este campo aceita apenas letras',
      }),

      username: z.string()
      .nonempty('O username é obrigatório').min(6, 'O nome de usuário precisa ter no mínimo 6 caracteres').max(150, 'o nome de usuário deve ter no máximo 150 caracteres').refine((value) => {

        const letterRegex = /^[a-zA-Z0-9]+$/;
        return (
          letterRegex.test(value)
        )
        }, {
        message: 'Este campo aceita apenas letras e números',
      }),
    }).refine((fields) => fields.password == fields.repeatPassword, {
      path: ['repeatPassword'],
      message: 'As senhas precisam ser iguais'
    }).refine((fields) => fields.agree == true, {
      path: ['agree'],
      message: 'Você precisa aceitar os termos antes de se cadastrar'
    });;

    type CreateUserFormData = z.infer<typeof createUserFormSchema>

    const { register,
      handleSubmit,
      getValues,
      formState: {errors} } 
      = useForm<CreateUserFormData>({
      resolver: zodResolver(createUserFormSchema),
    }) 

    const handleAvailableUsernames = async (username) => {
        if (!username) {
          setAvailableUsernameResult(<span className="text-red-400 text-xs">Digite um nome de usuário para ser testado</span>)
          return;
        } 
        if (errors.username) {
          setAvailableUsernameResult(<span className="text-red-400 text-xs">Corrija os erros acima antes de testar</span>)
          return;
        }
        const result = await getAvailableUsernames(username);
        if (result == true) {
          setAvailableUsernameResult(<span className="text-red-400 text-xs">Nome de usuário já em uso</span>)
        } else {
          setAvailableUsernameResult(<span className="text-green-400 text-xs">Nome de usuário disponível</span>)
        }
      };

    const Submiting = (data: CreateUserFormData) => {
      try {
        post(data);
        setSuccess('O seu cadastro foi realizado com sucesso!');
      } catch (error) {
        console.log(error);
      }
    };
  

  
    return (
      <>
        {success ? (
          <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-green-400 text-center">{success}</h1>
            <Button
                onClick={onClickAqui}
                pxValue={8}
                pyValue={4}
                extraClassName="inline-block w-full leading-none shadow"
              >
                Login
              </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(Submiting)}>
            <div className="mb-4 grid grid-row-2 grid-cols-6 space-x-1 w-full">
              <div className="col-span-5">
                <input
                  type="text"
                  placeholder="Nome de usuário"
                  className="apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none"
                  {...register('username')}
                ></input>
                <div className="flex flex-col gap-2">
                  {errors.username && <span className="text-xs text-red-400">{errors.username.message}</span>}
                  {availableUsernameResult}
                </div>
              </div>
              <div className="col-span-1">
                <Button
                  onClick={() => handleAvailableUsernames(getValues("username"))}
                  pxValue={2}
                  pyValue={2}
                  extraClassName="h-12 w-14 text-sm"
                  type="button"
                >
                  Testar
                </Button> 
              </div>
            </div>
            <div className="mb-4">
              <input
                type="email"
                placeholder="E-mail"
                className="apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none"
                {...register('email')}
              ></input>
              {errors.email && <span className="text-xs text-red-400">{errors.email.message}</span>}
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Senha"
                className="apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none"
                {...register('password')}
              ></input>
              {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
            </div>
            <div className="mb-4">
              <input
                type="password"
                placeholder="Repita a senha"
                className="apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none"
                {...register('repeatPassword')}
              ></input>
              {errors.repeatPassword && <span className="text-xs text-red-400">{errors.repeatPassword.message}</span>}
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Primeiro nome"
                className="apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none"
                {...register('first_name')}
              ></input>
              {errors.first_name && <span className="text-xs text-red-400">{errors.first_name.message}</span>}
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Sobrenome (OPCIONAL)"
                className="apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none"
                {...register('last_name')}
              ></input>
              {errors.last_name && <span className="text-xs text-red-400">{errors.last_name.message}</span>}
            </div>
            <div className="mb-4">
              <div className= "flex flex-row gap-2 text-black-300">
                <input type="checkbox"{...register('agree')}/>
                <p>Concordo com os termos</p>
              </div>
              {errors.agree && <span className="text-xs text-red-400">{errors.agree.message}</span>}
            </div>
            <div className="mb-4">
              <Button
                onClick={null}
                pxValue={8}
                pyValue={4}
                extraClassName="inline-block w-full leading-none shadow"
              >
                CADASTRAR
              </Button>
            </div>
            <div className="nb-4">
              <p className="text-black-300">
                Já possui uma conta?{' '}
                <a href="#" onClick={onClickAqui} className="text-blue-600">
                  Entre aqui.
                </a>
              </p>
            </div>
          </form>
        )}
      </>
    );
  };
  
  export default FormCadastro;

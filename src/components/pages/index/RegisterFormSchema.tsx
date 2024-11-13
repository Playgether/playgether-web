import { z } from 'zod';

export const RegisterFormSchema = () => {
    const RegisterFormSchema = z.object({
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
      });

      return RegisterFormSchema
}
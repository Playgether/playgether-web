import React from "react";
import Button from "../../elements/Button";

const FormCadastro = ({action, onClickAqui}) => {
    return (
        <form action={action}>
            <div className='mb-4'>
                <input type='text' placeholder='E-mail' className='apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none'></input>
            </div>
            <div className='mb-4'>
                <input type='password' placeholder='Senha' className='apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none'></input>
            </div>
            <div className='mb-4'>
                <input type='password' placeholder='Repita a senha' className='apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none'></input>
            </div>
            <div className='mb-4'>
                <input type='password' placeholder='Nome' className='apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none'></input>
            </div>
            <div className='mb-4'>
                <Button
                onClick={null}
                pxValue={8}
                pyValue={4}
                extraClassName={'inline-block w-full leading-none shadow'}          
                >
                CADASTRAR
                </Button>
            </div>
            <div className='nb-4'>
                <p>Já possui uma conta? <a href='#' onClick={onClickAqui} className='text-blue-600'>Entre aqui.</a></p>
            </div>
        </form>
    );
};

export default FormCadastro

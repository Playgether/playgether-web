import React, { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{
    register: () => void
    children: React.ReactNode;
}


const InputLayout = ({children, register, ...rest} : InputProps) => {

    return (
        <div className={twMerge('mb-3', rest.className)}>
            <input 
            {...rest}
            {...register}
            className={twMerge('apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none', rest.className)}
            >         
            </input>
            {children}
        </div>
    );
};

export default InputLayout;
import React, { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLTextAreaElement>{
    register: () => void
}


const TextAreaLayout = ({ register, ...rest} : InputProps) => {

    return (
        <div className={twMerge('mb-3', rest.className)}>
            <textarea
            {...rest}
            {...register}
            className={twMerge('apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none', rest.className)}
            />         
        </div>
    );
};

export default TextAreaLayout;
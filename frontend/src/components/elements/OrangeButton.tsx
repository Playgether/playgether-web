import React from "react";
import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{

}


const OrangeButton = ({children, ...rest}: ButtonProps) => {

    return (
        <button 
        {...rest}
        className={twMerge('bg-orange-500 rounded text-white-200 shadow hover:bg-orange-700 text-center', rest.className)}>
            {children}          
        </button>
    );
};

export default OrangeButton;

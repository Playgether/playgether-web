import React from "react";
import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{

}


const OrangeButton = ({children, ...rest}: ButtonProps) => {

    return (
        <button 
        {...rest}
        className={twMerge('bg-orange-500 rounded text-white-200 shadow hover:bg-orange-700 text-center bg-gradient-to-r from-red-500  to-orange-500 hover:from-green-400 hover:via-blue-400 hover:to-blue-500', rest.className)}>
            {children}          
        </button>
    );
};

export default OrangeButton;

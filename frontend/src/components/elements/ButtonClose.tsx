import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{

}

const ButtonClose = ({children, ...rest}: ButtonProps) => {
    return(

        <button 
        {...rest}
        className={twMerge('bg-red-500 rounded text-white-200 shadow hover:bg-red-700 text-xl text-center flex justify-center items-center px-4 py-4' ,rest.className)} 
        >
            {children}
        </button>

    );
};

export default ButtonClose
import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** Este é o button padrão utilizado para fechar componentes, assim como DefaultButton, ele pode receber qualquer elemento de um button normal além do className */
const ButtonClose = ({ children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={twMerge(
        "bg-red-500 rounded text-white-200 shadow hover:bg-red-700 text-center flex justify-center items-center px-4 py-4",
        rest.className
      )}
    >
      {children}
    </button>
  );
};

export default ButtonClose;

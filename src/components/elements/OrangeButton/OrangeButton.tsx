import React from "react";
import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{

}

/** Este componente cria um "Button" laranja com a cor padrão da paleta de cores da marca, qualquer button executável deve seguir o padrão de utilizar este componente. Ele 
 * pode receber qualquer propriedade que um Button html recebe, além do className para adicionar certos estilos para ele (tamanho, largura etc).
 */
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

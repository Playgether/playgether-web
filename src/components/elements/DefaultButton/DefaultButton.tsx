"use client"
import React from "react";
import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

/** Este componente cria um "Button" laranja com a cor padrão da paleta de cores da marca, qualquer button executável deve seguir o padrão de utilizar este componente. Ele
 * pode receber qualquer propriedade que um Button html recebe, além do className para adicionar certos estilos para ele (tamanho, largura etc).
 */
const DefaultButton = ({ children, ...rest }: ButtonProps) => {
  return (
    <button
      {...rest}
      className={twMerge(
        "DefaultButton-wrapper rounded text-center",
        rest.className
      )}
    >
      {children}
    </button>
  );
};

export default DefaultButton;

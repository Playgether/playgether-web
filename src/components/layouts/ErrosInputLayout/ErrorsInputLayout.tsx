import { HTMLAttributes } from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import { twJoin } from "tailwind-merge";

export interface ErrosInputProps extends HTMLAttributes<HTMLDivElement> {
  /** Esta prop recebe a field de um formulário e o seu erro, e então cria o erro naquela field */
  field:
    | FieldError
    | Merge<FieldError, FieldErrorsImpl<any>>
    | undefined
    | { message: string };
}

/** Este componente recebe erros de formulários e adiciona na tela, exemplo: campo obrigatório, senha incorreta, etc ... */
export const ErrosInput = ({ field, ...rest }: ErrosInputProps) => {
  return (
    <div className={twJoin("", rest.className)}>
      {field && (
        <span className="text-xs text-red-400">{String(field.message)}</span>
      )}
    </div>
  );
};

import React, { InputHTMLAttributes, useState } from "react";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  register: any;
  inputClassName?: string;
}

const PasswordInput = ({ register, inputClassName, className, ...rest }: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className={twMerge("mb-3 rounded relative", className)}>
      <input
        {...rest}
        {...register}
        type={show ? "text" : "password"}
        className={twMerge(
          "h-full appearance-none block w-full px-4 py-3 pr-12 AnswerComment-text-area leading-tight rounded",
          inputClassName,
        )}
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default PasswordInput;

import React, { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  register: any;
  type: string;
  inputClassName?: string;
}

const InputLayout = ({
  register,
  inputClassName,
  className,
  ...rest
}: InputProps) => {
  return (
    <div className={twMerge("mb-3 rounded", className)}>
      <input
        {...rest}
        {...register}
        className={twMerge(
          "h-full appearance-none block w-full px-4 py-3 AnswerComment-text-area leading-tight rounded",
          inputClassName
        )}
      />
    </div>
  );
};

export default InputLayout;

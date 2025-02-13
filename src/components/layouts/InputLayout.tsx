import React, { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  register: any;
  type: string;
}

const InputLayout = ({ register, ...rest }: InputProps) => {
  return (
    <div className={twMerge("mb-3 rounded", rest.className)}>
      <input
        {...rest}
        {...register}
        className="h-full apperance-none block w-full px-4 py-3 AnswerComment-text-area leading-tight rounded"
      />
    </div>
  );
};

export default InputLayout;

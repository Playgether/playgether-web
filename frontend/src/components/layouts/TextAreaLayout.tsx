import React, { HTMLProps, TextareaHTMLAttributes} from "react";
import { twMerge, twJoin } from "tailwind-merge";
import TextareaAutosize from 'react-textarea-autosize'
import { TextareaAutosizeProps } from "react-textarea-autosize/dist/declarations/src";

interface InputProps extends TextareaAutosizeProps{
    register: any
    textAreaClassName?: HTMLProps<HTMLElement>['className'];
}


const TextAreaLayout = ({ register, textAreaClassName, ...rest} : InputProps) => {

    return (
        <div className={twJoin(rest.className)}>
            <TextareaAutosize 
            {...rest}
            {...register}
            className={twMerge('apperance-none block w-full px-4 py-3 leading-tight text-gray-700 bg-gray-50 focus:bg-white-200 border border-gray-50 focus:border-gray-500 rounded focus:outline-none', textAreaClassName)}
            />
        </div>
    );
};

export default TextAreaLayout;
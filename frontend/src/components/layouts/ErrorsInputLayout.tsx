import { HTMLAttributes } from "react";
import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form"
import { twJoin } from "tailwind-merge";

interface ErrosInputProps extends HTMLAttributes<HTMLDivElement> {
    field: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  
}

export const ErrosInput = ({field, ...rest} : ErrosInputProps) => {

    return (
        <div className={twJoin("", rest.className)}>
            {field && <span className="text-xs text-red-400">{String(field.message)}</span>}
        </div>
    )
}
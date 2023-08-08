import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form"

interface ErrosInputProps {
    field: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  
}

export const ErrosInput = ({field} : ErrosInputProps) => {

    return (
        <div>
            {field && <span className="text-xs text-red-400">{String(field.message)}</span>}
        </div>
    )
}
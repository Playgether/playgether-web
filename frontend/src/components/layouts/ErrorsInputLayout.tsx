import OrangeButton from "../elements/OrangeButton"

interface ErrosInputProps {
    field: {
        message: any
    }
}



export const ErrosInput = ({field}) => {

    return (
        // <div className="flex flex-col gap-2">
        //     <span className="text-xs text-red-400">{children}</span>
        // </div>
        <div>
            {field && <span className="text-xs text-red-400">{field.message}</span>}
        </div>
    )
}
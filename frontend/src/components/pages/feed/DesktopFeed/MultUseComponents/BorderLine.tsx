import { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

interface BorderLineProps extends HTMLAttributes<HTMLDivElement>{

}

export const BorderLine = ({...rest}:BorderLineProps) => {
    return (
        <div className={twMerge("border-b border-b-gray-300 pt-2", rest.className)}></div>
    )
}
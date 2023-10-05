import { HTMLAttributes } from "react"
import {CgSpinner} from "react-icons/cg"
import { twJoin } from "tailwind-merge"

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {

}

export const Loading = ({...rest}:LoadingProps) => {
    return (
        <CgSpinner className={twJoin("animate-spin text-blue-500", rest.className)}/>
    )
}
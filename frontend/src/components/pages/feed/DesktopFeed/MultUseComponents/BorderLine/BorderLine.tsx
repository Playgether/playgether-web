import { HTMLAttributes } from "react"
import { twMerge } from "tailwind-merge"

//** Este componente pode receber qualquer atrivuto HTML de uma div, inclusive o className */
interface BorderLineProps extends HTMLAttributes<HTMLDivElement>{

}

/** Este componente é responsável por criar uma linha na borda inferior de algum local. Ele possui um estilo padrão, mas pode aceitar outras variações css através do className */
export const BorderLine = ({...rest}:BorderLineProps) => {
    return (
        <div className={twMerge("border-b border-b-gray-300 pt-2", rest.className)}></div>
    )
}
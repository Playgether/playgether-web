import React from "react"

/** Este é o Card padrão utilizado para rendenrizar as opção dos jogos */
export const CardGames = ({ children }) => {
    return (
        <div className="max-w-[20rem] max-h-56 shadow-md shadow-slate-300 hover:cursor-pointer overflow-hidden">
            {children}
        </div>
    )
}
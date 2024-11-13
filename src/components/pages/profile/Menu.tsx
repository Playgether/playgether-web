import { useState } from "react"

export const MenuProfile = ({setContent, content}: {setContent:(content:string)=>void, content:string}) => {

    const [animation, setAnimation] = useState('')

    const handleContent = (textContent:string) => {
        setContent(textContent)
    }

    return (
        <div className="w-full bg-blue-300 rounded-lg h-16 shadow-md shadow-gray-400">
            <ul className="w-full flex justify-between text-blue-500 items-center h-full px-8 font-medium">
                <div className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "bio" ? "bg-blue-400 bg-opacity-30" : ""}`}
                onClick={()=> handleContent("bio")}>
                    <li><a>Bio</a></li>
                </div>
                <div 
                className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "medias" ? "bg-blue-400 bg-opacity-30" : ""}`} 
                onClick={()=> handleContent("medias")}>
                    <li><a>Medias</a></li>
                </div>
                <div 
                className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "textos" ? "bg-blue-400 bg-opacity-30" : ""}`} 
                onClick={()=> handleContent("textos")}>
                    <li><a>Textos</a></li>
                </div>
                <div 
                className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-28 cursor-pointer 
                ${animation} 
                ${content === "estatisticas" ? "bg-blue-400 bg-opacity-30" : ""}`} 
                onClick={()=> handleContent("estatisticas")}>
                    <li><a>Estatísticas</a></li>
                </div>
                <div 
                className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-28 cursor-pointer 
                ${animation} 
                ${content === "conquistas" ? "bg-blue-400 bg-opacity-30" : ""}`} 
                onClick={()=> handleContent("conquistas")}>
                    <li><a >Conquistas</a></li>
                </div>
                <div className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "marcos" ? "bg-blue-400 bg-opacity-30" : ""}`} 
                onClick={()=> handleContent("marcos")}>
                    <li><a>Marcos</a></li>
                </div>

                <div className={`hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer 
                ${animation} 
                ${content === "games" ? "bg-blue-400 bg-opacity-30" : ""}`} 
                onClick={()=> handleContent("games")}>
                    <li><a>Jogos</a></li>
                </div>
            </ul>
        </div>
    )
}
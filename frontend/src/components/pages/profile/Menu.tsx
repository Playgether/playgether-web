export const MenuProfile = () => {
    return (
        <div className="w-full bg-blue-300 rounded-lg h-16 shadow-md shadow-gray-400">
            <ul className="w-full flex justify-between text-blue-500 items-center h-full px-8 font-medium">
                <div className="hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer">
                    <li><a href="">Bio</a></li>
                </div>
                <div className="hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer">
                    <li><a href="">Medias</a></li>
                </div>
                <div className="hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer">
                    <li><a href="">Textos</a></li>
                </div>
                <div className="hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-28 cursor-pointer">
                    <li><a href="">Estatísticas</a></li>
                </div>
                <div className="hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-28 cursor-pointer">
                    <li><a href="">Conquistas</a></li>
                </div>
                <div className="hover:bg-blue-400 hover:bg-opacity-30 h-full flex flex-col items-center justify-center rounded-lg w-20 cursor-pointer">
                    <li><a href="">Marcos</a></li>
                </div>
            </ul>
        </div>
    )
}
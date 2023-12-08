import { IoIosMegaphone } from "react-icons/io"

export const ResponsiveGlobalChat = () => {
    return (
        <div className="flex items-center justify-center gap-5 w-full bg-white-300">
            <div className="w-1/6 rounded-lg relative h-10 z-10 bg-white-300">
                <div className="inset-0 bg-purple-600 absolute bg-blur-sm rounded-lg bg-gradient-to-r from-pink-400 via-purple-500 to-purple-500 animate-moveRight">
                    {/* <div className="leading-none cursor-pointer bg-blue-400 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 hover:from-blue-500 hover:via-blue-600 hover:to-blue-600 flex items-center justify-center gap-2 relative rounded-lg z-10">
                        <button>MEGAFONE</button>
                        <IoIosMegaphone className="w-1/6 h-3/6 -rotate-12"/>
                    </div> */}
                </div>
                <div className="inset-0 m-1 ml-1 mr-1 rounded-lg absolute flex bg-blue-400 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 hover:from-blue-500 hover:via-blue-600 hover:to-blue-600 gap-2 text-xs items-center justify-center">
                    <IoIosMegaphone className="w-5 h-5 -rotate-12"/>
                </div>

            </div>
            <div className="flex-grow z-0">     
                <p className="text-black-400 text-xs animate-slideLeft">
                    TEXTO DE EXEMPLO 
                </p>
            </div>
        </div>
    )
}
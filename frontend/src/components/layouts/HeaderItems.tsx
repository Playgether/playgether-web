'use client'

import { MdOutlineNotifications, MdOutlineLogout, MdOutlineSettings, MdPersonAddAlt, MdOutlineVolumeUp, MdOutlineChatBubbleOutline } from "react-icons/md";
import { useAuthContext } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export const ItemsHeader = () => {

    const {logout} = useAuthContext()
    const router = useRouter()
    const handleLogout = async () =>{
        await logout()
        router.push('/')
    }

    return (

        <div className="bg-white-300 lg:bg-opacity-0 flex flex-col justify-center items-center lg:flex-row w-screen lg:w-full lg:items-center lg:justify-between mr-5 text-black-300 text-opacity-90 lg:pr-2 gap-4 p-4">
            <div className="flex md:h-5 md:w-5 lg:h-8 lg:w-8 gap-4 items-center justify-center">
                <p className="lg:hidden text-xl">Volume</p>
                <button className="h-full w-full"><MdOutlineVolumeUp className="lg:h-full lg:w-full h-7 w-7"/></button>
            </div>
            <div className="flex md:h-5 md:w-5 lg:h-8 lg:w-8 gap-4">
                <p className="lg:hidden text-xl">Convites</p>
                <button className="h-full w-full"><MdPersonAddAlt className="lg:h-full lg:w-full h-7 w-7"/></button>
            </div>
            <div className="flex md:h-5 md:w-5 lg:h-8 lg:w-8 gap-4">
                <p className="lg:hidden text-xl">Notificações</p>
                <button className="h-full w-full"><MdOutlineNotifications className="lg:h-full lg:w-full h-7 w-7" /></button>
            </div>
            <div className="flex md:h-5 md:w-5 lg:h-8 lg:w-8 gap-4">
                <p className="lg:hidden text-xl">Mensagens</p>
                <button className="h-full w-full"><MdOutlineChatBubbleOutline className="lg:h-full lg:w-full h-7 w-7" /></button>
            </div>
            <div className="flex md:h-5 md:w-5 lg:h-8 lg:w-8 gap-4">
                <p className="lg:hidden text-xl">Configurações</p>
                <button className="h-full w-full"><MdOutlineSettings className="lg:h-full lg:w-full h-7 w-7" /></button>
            </div>
            <div className="flex md:h-5 md:w-5 lg:h-8 lg:w-8 gap-4">
                <p className="lg:hidden text-xl" onClick={() => handleLogout()}>Logout</p>
                <button onClick={() => handleLogout()} className="h-full w-full"><MdOutlineLogout className="lg:h-full lg:w-full h-7 w-7" /></button>
            </div>
        </div> 
    )
   
} 
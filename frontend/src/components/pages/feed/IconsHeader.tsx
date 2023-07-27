'use client'

import React from "react";
import { MdOutlineNotifications, MdOutlineLogout, MdOutlineSettings, MdPersonAddAlt, MdOutlineVolumeUp, MdOutlineChatBubbleOutline } from "react-icons/md";
import { useAuthContext } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";

const IconsHeader = ({}) => {
    const {logout, isLoggedOut} = useAuthContext()
    const router = useRouter()
    const handleLogout = async () =>{
        await logout()
        router.push('/')
    }
    
    return (
        <div className="w-2/6 h-full flex items-center justify-end">
            <div className="flex flex-row w-4/6 h-full items-center mr-5 text-black-300 text-opacity-90">
                <div className="w-3/6 h-3/6 ">
                    <button className="h-full w-full"><MdOutlineVolumeUp className="h-full w-full"/></button>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <button className="h-full w-full"><MdPersonAddAlt className="h-full w-full"/></button>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <button className="h-full w-full"><MdOutlineNotifications className="h-full w-full" /></button>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <button className="h-full w-full"><MdOutlineChatBubbleOutline className="h-full w-full" /></button>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <button className="h-full w-full"><MdOutlineSettings className="h-full w-full" /></button>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <button onClick={() => handleLogout()} className="h-full w-full"><MdOutlineLogout className="h-full w-full" /></button>
                </div>
            </div>
        </div>
    );
};

export default IconsHeader
'use client'

import React, { useState } from "react";
import { MdOutlineNotifications, MdOutlineLogout, MdOutlineSettings, MdPersonAddAlt, MdOutlineVolumeUp, MdOutlineChatBubbleOutline } from "react-icons/md";
import { useAuthContext } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { ItemsHeader } from "./HeaderItems";
import { FiAlignJustify } from "react-icons/fi";

const IconsHeader = ({}) => {
    const [isMenuResponsiveShowing, setIsMenuResponsiveShowing] = useState(false)
    const {logout, isLoggedOut} = useAuthContext()
    const router = useRouter()

    const handleLogout = async () =>{
        await logout()
        router.push('/')
    }

    const handleMenuResponsive = () => {
        return setIsMenuResponsiveShowing(!isMenuResponsiveShowing)
    }

    
    return (
        <>
            <div className={`items-center justify-center bg-blue-300 ${isMenuResponsiveShowing? "absolute" : null}`}>
                <div className="h-full flex justify-center items-center">
                    <FiAlignJustify className="h-7 w-7 lg:hidden text-black-300" onClick={() => handleMenuResponsive()}/>
                </div>
                <ItemsHeader isMenuResponsiveShowing={isMenuResponsiveShowing}/>
            </div>
        </>
    );
};

export default IconsHeader
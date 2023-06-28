import React from "react";
import { MdOutlineNotifications, MdOutlineSettings, MdPersonAddAlt, MdOutlineVolumeUp, MdOutlineChatBubbleOutline } from "react-icons/md";

const IconsHeader = ({}) => {
    return (
        <div className="w-2/6 h-full flex items-center justify-end">
            <div className="flex flex-row w-4/6 h-full items-center mr-5 text-black-300 text-opacity-90">
                <div className="w-3/6 h-3/6 ">
                    <a href=""><MdOutlineVolumeUp className="h-full w-full"/></a>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <a href=""><MdPersonAddAlt className="h-full w-full" /></a>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <a href=""><MdOutlineNotifications className="h-full w-full" /></a>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <a href=""><MdOutlineChatBubbleOutline className="h-full w-full" /></a>
                </div>
                <div className="w-3/6 h-3/6 ">
                    <a href=""><MdOutlineSettings className="h-full w-full" /></a>
                </div>
            </div>
        </div>
    );
};

export default IconsHeader
import React from "react";
import { SiValorant, SiCounterstrike } from "react-icons/si";
import { useAuthContext } from "../../../context/AuthContext";
import OrangeButton from "../../elements/OrangeButton";

const ProfileCard = ({}) => {
    const {user} = useAuthContext()
    return (

        <div className="bg-white-200 h-3/6 flex pt-2 flex-col items-center space-y-2 rounded-lg shadow-lg">
            <div className="flex flex-row items-center justify-center w-full pb-2 bg-white-400">
                <h1 className="font-medium text-black-200 text-center pt-2 border-b border-black-200 border-opacity-30 text-md w-4/6 text-md">Profile</h1>
            </div>
            <div className="rounded-full h-20 w-20 flex items-center justify-center relative bg-red-200">
                <h1 className="text-sm">pic</h1>
            </div>
            <div className="text-center w-full">
                <h1 className="text-xl text-black-300">Henry James</h1>
                <p className="text-sm text-black-200 opacity-90">{user?.username}</p>
            </div>
            <div className="w-full">
                <p className=" text-xs text-center text-black-200 opacity-90">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            </div>
            <div className="flex space-x-3">
                <SiValorant/>
                <SiCounterstrike />
            </div>
            <div>
                <OrangeButton className="text-sm font-semibold px-6 py-3">Ver Perfil</OrangeButton>
            </div>
        </div>

    );
};

export default ProfileCard;
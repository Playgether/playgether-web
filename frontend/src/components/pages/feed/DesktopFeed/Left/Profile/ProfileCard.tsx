import React from "react";
import { SiValorant, SiCounterstrike } from "react-icons/si";

import { ProfileCardBio } from "./ProfileCardBio";

import Image from "next/legacy/image";
import { CgProfile } from "react-icons/cg"
import { useAuthContext } from "../../../../../../context/AuthContext";
import { useProfileContext } from "../../../../../../context/ProfileContext";
import OrangeButton from "../../../../../elements/OrangeButton/OrangeButton";


/** Este componente é o wrapper principal do card de profile na página feed. Seu intuito é ser o wrapper de todo o card e seus componentes filhos. */
const ProfileCard = ({}) => {
    const {user} = useAuthContext()
    const {profile} = useProfileContext()

    return (
        
        <div className="bg-white-200 h-3/6 flex pt-2 flex-col items-center space-y-2 rounded-lg shadow-lg pb-4">
            <div className="flex flex-row items-center justify-center w-full pb-2 bg-white-400">
                <h1 className="font-medium text-black-200 text-center pt-2 border-b border-black-200 border-opacity-30 text-md w-4/6 text-md">Profile</h1>
            </div>
            <div className="rounded-full h-20 w-20 flex items-center justify-center relative bg-white-200">
                {profile?.profile_photo === null || profile?.profile_photo === undefined ? (
                    <CgProfile className="h-full w-full text-gray-300"/>
                ) : (
                    <Image src={`${profile?.profile_photo}`} 
                    width={400} 
                    height={400} 
                    alt={"Imagem de perfil do card profile do feed"}
                    className="rounded-full"/>
                )}
                
            </div>
            <div className="text-center w-full">
                <h1 className="text-xl text-black-300">{user?.first_name} {user?.last_name}</h1>
                <p className="text-sm text-black-200 opacity-90">{user?.username}</p>
            </div>
            <ProfileCardBio />
            <div className="flex space-x-3 text-black-400">
                <SiValorant/>
                <SiCounterstrike />
            </div>
            <div>
                <OrangeButton className="text-sm font-semibold xl:px-6 xl:py-3 lg:px-6 lg:py-2">Ver Perfil</OrangeButton>
            </div>
        </div>
      
    );
};

export default ProfileCard;
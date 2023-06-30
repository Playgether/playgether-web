import React from "react";
import Button from "../../elements/Button";
import { SiValorant, SiCounterstrike } from "react-icons/si";

const ProfileCard = ({}) => {
    return (

        <div className="bg-white-200 h-3/6 flex pt-2 flex-col items-center space-y-2 rounded-lg shadow-lg">
            <div className="rounded-full h-20 w-20 bg-red-200 flex items-center justify-center relative">
                <h1 className="text-sm">pic</h1>
            </div>
            <div className="text-center w-full">
                <h1 className="text-xl">Henry James</h1>
                <p className="text-sm text-black-200 opacity-90">@henryjames13</p>
            </div>
            <div className="w-full">
                <p className=" text-xs text-center text-black-200 opacity-90">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
            </div>
            <div className="flex space-x-3">
                <SiValorant/>
                <SiCounterstrike />
            </div>
            <div>
                <Button onClick={null} extraClassName={"text-sm font-semibold"} pxValue={6} pyValue={3}>Ver Perfil</Button>
            </div>
        </div>

    );
};

export default ProfileCard;
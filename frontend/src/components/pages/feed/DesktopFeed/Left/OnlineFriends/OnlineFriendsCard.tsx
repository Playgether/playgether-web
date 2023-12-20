import React from "react";
import {MdSearch} from "react-icons/md";
import OnlineFriendsList from "./OnlineFriendsList";

const OnlineFriendsCard = ({}) => {
    return (

        <div className="bg-white-200 h-3/6 shadow-lg">
            <h1 className="font-medium text-black-200 text-center pt-2">Amigos Online</h1>
            <div className="flex bg-white-200 items-center justify-center pt-4">
                <MdSearch className="w-1/6 h-6"/>
                <input type='search' placeholder='Pesquisar' className="bg-white-200 bg-opacity-10 w-full h-full rounded-lg focus:outline-none text-black-400 text-left"></input>
            </div>
            <div className="border-b border-black-200 border-opacity-30"></div>
            <OnlineFriendsList />
            <div className="text-black-200 text-center pt-4">
                <a href=""><h1>Ver Todos</h1></a>
            </div>
        </div>

    );
};

export default OnlineFriendsCard;
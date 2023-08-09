import React from "react";
import {BiWorld} from "react-icons/bi";

const GlobalChat = ({}) => {
    return (
        <div className=" w-full h-20 flex items-center border-b border-black-200 border-opacity-40 justify-center">
            <div className=" w-1/6 text-center flex space-x-4 items-center justify-center h-full text-blue-500 ">
                <h1 className="uppercase bold font-semibold ml-6">global chat</h1>
                <BiWorld className="w-1/6 h-3/6"/>
            </div>
            <div className="flex-1 h-full flex flex-row items-center ml-6 w-full">
                <div>
                    <h1 className="text-blue-500 font-semibold">Flávio Alessandro:</h1>
                </div>
                <div className="ml-2">
                    <p className="font-normal text-black-300">s jungler minimo ouro para o próximo Rei do lol. Entre em contato comigo para mais informações dasdasdsadsadsadsadsadsadsadasdasdasdsadasdsdsa</p>
                </div>
            </div>
        </div>
    );
};

export default GlobalChat
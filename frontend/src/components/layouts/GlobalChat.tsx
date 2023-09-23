'use client'

import React, { useEffect, useState } from "react";
import {BiWorld} from "react-icons/bi";
import {IoIosMegaphone} from 'react-icons/io'
import TextLimitComponent from "./TextLimitComponent";

const GlobalMessages = [
    {
        id: 1,
        username: 'Flávio Alessandro',
        message: 'jungler minimo ouro para o próximo Rei do lol. Entre em contato comigo para mais informações'
    },
    {
        id: 2,
        username: 'Marcos Andrade',
        message: 'Clã TheUnification recrutando agora. Participamos de vários campeonatos e somos uma comunidade incrivel, entre em contato para mais informações'
    },
    {
        id: 3,
        username: 'Rodrigo Santos',
        message: 'Thread LoLDiscuss, a melhor thread para o debate sobre o lol'
    },
    {
        id: 4,
        username: 'Aline Moreira',
        message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
    },
    {
        id: 5,
        username: 'Sophia Andrade',
        message: 'Estamos procurando pessoas para jogar com a gente no nosso cla, somos amiguáveis, não tóxicos, e ótimos para se ter como teamate, quem quiser fazer um teste ou algo assim, só me mandar mensagem no privado, estaremos respondendo todos'
    },
    {
        id: 6,
        username:'Sophia Andrade',
        message: 'p'
    }
]

const GlobalChat = ({}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const currentMessage = GlobalMessages[currentIndex];
        const messageLength = currentMessage.message.length;
        const maxAnimationTime = 30000
        const animationTime = Math.min(messageLength / 1000, maxAnimationTime);
        const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1 < GlobalMessages.length ? prevIndex + 1 : 0));
        }, 30000);

        return () => clearInterval(intervalId);
    }, [GlobalMessages]);

    

    return (
        <div className="bg-white-300 absolute w-full h-14 flex items-center border-b border-black-200 border-opacity-40 justify-center inset-x-0 bottom-0 bg-blur-sm  overflow-x-hidden overflow-y-hidden">

            <div className="relative h-full w-40 bg-white-300 flex items-center justify-center z-20">
                <div className="w-full text-center flex gap-3 items-center justify-center h-full text-blue-500 object-cover">
                    <h1 className="uppercase bold font-semibold ml-6 lg:text-sm">Megafone</h1>
                    <IoIosMegaphone className="w-1/6 h-3/6"/>
                </div>
            </div>


            {GlobalMessages.map ((item, index) =>
                <div className={`h-full flex flex-row items-center w-full z-0 ${index === currentIndex ? '' : 'hidden'}`}>
                    <TextLimitComponent 
                    text={item.username + ":"} 
                    maxCharacters={192} 
                    className={`lg:text-sm z-10 bg-white-300 h-full flex items-center justify-center ${index === currentIndex ? 'animate-fadeIn' : 'animate-fadeOut'}`} 
                    paragraphClassName="whitespace-no-wrap font-semibold text-blue-500 pl-2 px-2"/>

                    <div 
                    className={`flex-1 h-full flex flex-row items-center w-full z-0 ${index === currentIndex ? 'animate-slideLeft' : 'hidden'}`}
                    key={item.id}
                    >
                        <TextLimitComponent 
                        text={item.message} 
                        maxCharacters={250} 
                        className="flex-1 ml-2 lg:text-sm z-0" 
                        paragraphClassName="whitespace-no-wrap font-normal text-black-300"/>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalChat
'use client'

import React, { useEffect, useState } from "react";
import {IoIosMegaphone} from 'react-icons/io'
import TextLimitComponent from "./TextLimitComponent";

const GlobalMessages = [
    {
        id: 1,
        username: 'Flávio Silva',
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
        message: "Thread LoLDiscuss, a melhor thread para o debate sobre o lol "
    },
    {
        id: 4,
        username: 'Aline Moreira',
        message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
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
        const intervalId = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1 < GlobalMessages.length ? prevIndex + 1 : 0));
        }, 30000);

        return () => clearInterval(intervalId);
    }, [GlobalMessages]);

    

    return (
        <>
        <div className="w-full absolute h-16 bg-white-300 bottom-0 flex rounded-lg overflow-x-hidden overflow-y-hidden">
            <div className="bg-white-200 h-full flex items-center relative rounded-lg z-20">
                <div className="inset-0 bg-purple-600 absolute blur-sm rounded-md bg-gradient-to-r from-pink-400 via-purple-500 to-purple-500 animate-moveRight"></div>
                <div className="cursor-pointer leading-none bg-blue-400 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-500 hover:from-blue-500 hover:via-blue-600 hover:to-blue-600 w-40 h-14 flex items-center justify-center gap-2 relative ml-1 mr-1 rounded-lg z-10">
                    <button>MEGAFONE</button>
                    <IoIosMegaphone className="w-1/6 h-3/6 -rotate-12"/>
                </div>
            </div>
            
            <div className="bg-white-300 flex-1 text-black-400 relative right-0">
                {GlobalMessages.map((message, index)=>

                  <div className={`w-full h-16 flex items-center gap-2  ${index === currentIndex ? '':'hidden'}`} key={message.id}>
                    <TextLimitComponent 
                        text={message.username + ':'}
                        maxCharacters={40}
                        className={`relative z-10 bg-white-300 h-full lg:text-sm flex items-center justify-center ${index === currentIndex ? 'animate-fadeIn':'animate-fadeOut'}`}
                        paragraphClassName="pl-2 font-semibold text-blue-500"
                    />

                    <TextLimitComponent 
                        text={message.message}
                        maxCharacters={400}
                        className={`relative flex-1 lg:text-sm z-0 flex items-center w-full ${index === currentIndex ? 'animate-slideLeft':'hidden'}`}
                        paragraphClassName="pr-2"
                    />
                    
                </div>   

                )}
            </div>     
        </div>
        </>

    );
};

export default GlobalChat
'use client'

import { useEffect, useState } from "react";
import TextLimitComponent from "../SuspenseFallBack/TextLimitComponent/TextLimitComponent";


enum volumes {
    low = 10000,
    medium = 20000,
    high = 30000,
}


export const GlobalMessages = [
    {
        id: 1,
        username: 'Flávio Silva',
        message: 'jungler minimo ouro para o próximo Rei do lol. Entre em contato comigo para mais informações',
        volume: 'low'
    },
    {
        id: 2,
        username: 'Marcos Andrade',
        message: 'Clã TheUnification recrutando agora. Participamos de vários campeonatos e somos uma comunidade incrivel, entre em contato para mais informações',
        volume: 'medium'   
    },
    {
        id: 3,
        username: 'Rodrigo Santos',
        message: "Thread LoLDiscuss, a melhor thread para o debate sobre o lol ",
        volume: 'low'
    },
    {
        id: 4,
        username: 'Aline Moreira',
        message: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
        volume: 'high'
    },
    {
        id: 5,
        username: 'Sophia Andrade',
        message: 'Estamos procurando pessoas para jogar com a gente no nosso cla, somos amiguáveis, não tóxicos, e ótimos para se ter como teamate, quem quiser fazer um teste ou algo assim, só me mandar mensagem no privado, estaremos respondendo todos',
        volume:'high'
    },
    {
        id: 6,
        username:'Sophia Andrade',
        message: 'p',
        volume: 'low'
    }
]

export const IntervalFunctionComponent = () => {

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const currentMessage = GlobalMessages[currentIndex]
        const currentVolume = volumes[currentMessage.volume]
        const intervalId = setInterval(() => {
          setCurrentIndex((prevIndex) => {
            return prevIndex + 1 < GlobalMessages.length ? prevIndex + 1 : 0;
          });
        }, currentVolume);
      
        return () => clearInterval(intervalId);
      }, [currentIndex, GlobalMessages, volumes]);

    return (
        <div className="bg-white-300 flex-1 text-black-400 relative right-0">
            {GlobalMessages.map((message, index)=>

                <div className={`w-full h-16 flex flex-col lg:flex lg:flex-row items-center gap-2  ${index === currentIndex ? '':'hidden'}`} key={message.id}>
                    <TextLimitComponent 
                        text={message.username + ':'}
                        maxCharacters={40}
                        className={`relative z-10 lg:bg-white-300 lg:h-full text-xs lg:text-sm flex items-center justify-center -mt-4 -ml-14 lg:ml-0 lg:mt-0 ${index === currentIndex ? 'animate-fadeIn':'animate-fadeOut'}`}
                        paragraphClassName="pl-2 font-semibold text-blue-500"
                    />

                    <TextLimitComponent 
                        text={message.message}
                        maxCharacters={300}//400 or 150
                        className={`relative flex-1 fkex lg:text-sm text-xs z-0 flex items-center w-full ${index === currentIndex ? 'animate-slideLeftResponsive lg:animate-slideLeft':'hidden'}`}
                        paragraphClassName="pr-2"
                    />
                    
                </div>   

            )}
        </div> 
    )


}
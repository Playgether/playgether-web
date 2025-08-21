"use client";

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
    username: "Flávio Silva",
    message: "Primeira mensagem (5 segundos)",
    volume: "low",
    time: 10000,
    showed: false,
  },
  // {
  //   id: 2,
  //   username: "Marcos Andrade",
  //   message: "Segunda mensagem (7 segundos)",
  //   volume: "medium",
  //   time: 20000,
  //   showed: false,
  // },
  {
    id: 3,
    username: "Rodrigo Santos",
    message: "Terceira mensagem (5 segundos)",
    volume: "low",
    time: 10000,
    showed: false,
  },
  {
    id: 4,
    username: "Aline Moreira",
    message: "Quarta mensagem (10 segundos)",
    volume: "high",
    time: 30000,
    showed: false,
  },
  {
    id: 5,
    username: "Sophia Andrade",
    message: "Quinta mensagem (10 segundos)",
    volume: "high",
    time: 30000,
    showed: false,
  },
  {
    id: 6,
    username: "Sophia Andrade",
    message: "Sexta mensagem (10 segundos)",
    volume: "high",
    time: 10000,
    showed: false,
  },
  {
    id: 7,
    username: "Sophia Andrade",
    message: "Sétima mensagem (10 segundos)",
    volume: "high",
    time: 20000,
    showed: false,
  },
  {
    id: 8,
    username: "Sophia Andrade",
    message:
      "Oitava mensagem (10 segundos) kdospakdopsakdopsakpdksapodkaskdopaskdopsakdopsakopdkaspodksopakdposakdopksopadopas",
    volume: "high",
    time: 30000,
    showed: false,
  },
  {
    id: 9,
    username: "Sophia Andrade",
    message: "Nona mensagem (10 segundos)",
    volume: "high",
    time: 10000,
    showed: false,
  },
  {
    id: 10,
    username: "Sophia Andrade",
    message: "Décima mensagem (10 segundos)",
    volume: "high",
    time: 20000,
    showed: false,
  },
  // {
  //   id: 6,
  //   username: "Flávio Silva",
  //   message:
  //     "jungler minimo ouro para o próximo Rei do lol. Entre em contato comigo para mais informações",
  //   volume: "low",
  //   time: 10000,
  //   showed: false,
  // },
  // {
  //   id: 7,
  //   username: "Marcos Andrade",
  //   message:
  //     "Clã TheUnification recrutando agora. Participamos de vários campeonatos e somos uma comunidade incrivel, entre em contato para mais informações",
  //   volume: "medium",
  //   time: 20000,
  //   showed: false,
  // },
  // {
  //   id: 8,
  //   username: "Rodrigo Santos",
  //   message: "Thread LoLDiscuss, a melhor thread para o debate sobre o lol ",
  //   volume: "low",
  //   time: 10000,
  //   showed: false,
  // },
  // {
  //   id: 9,
  //   username: "Aline Moreira",
  //   message:
  //     "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  //   volume: "high",
  //   time: 30000,
  //   showed: false,
  // },
  // {
  //   id: 10,
  //   username: "Sophia Andrade",
  //   message:
  //     "Estamos procurando pessoas para jogar com a gente no nosso cla, somos amiguáveis, não tóxicos, e ótimos para se ter como teamate, quem quiser fazer um teste ou algo assim, só me mandar mensagem no privado, estaremos respondendo todos",
  //   volume: "high",
  //   time: 30000,
  //   showed: false,
  // },
  // {
  //   id: 11,
  //   username: "Sophia Andrade",
  //   message: "Mid laner precisa de duo fixo para subir de elo.",
  //   volume: "low",
  //   time: 10000,
  //   showed: false,
  // },
  // {
  //   id: 12,
  //   username: "Flavio 7",
  //   message: "Time procurando suporte experiente para torneios amadores.",
  //   volume: "high",
  //   time: 30000,
  //   showed: false,
  // },
  // {
  //   id: 13,
  //   username: "Aline Moreira 8",
  //   message: "ADC disponível para treinos noturnos, prata no momento.",
  //   volume: "low",
  //   time: 10000,
  //   showed: false,
  // },
  // {
  //   id: 14,
  //   username: "Flavio 9",
  //   message:
  //     "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum",
  //   volume: "high",
  //   time: 30000,
  //   showed: false,
  // },
];

export const IntervalFunctionComponent = () => {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [timers, setTimers] = useState([]); // Estado para rastrear os tempos restantes

  useEffect(() => {
    const initialMessages = GlobalMessages.slice(0, 3).map((msg) => ({
      ...msg,
      showed: true,
    }));
    setVisibleMessages(initialMessages);
    // console.log(initialMessages);
    // console.log(visibleMessages);

    // Inicializa os timers com os tempos das mensagens
    setTimers(initialMessages.map((msg) => msg.time));

    const timeouts = initialMessages.map((message, index) =>
      setTimeout(() => handleReplaceMessage(index), message.time)
    );

    // Configura um intervalo para atualizar os tempos restantes
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((time, index) => (time > 0 ? time - 100 : 0))
      );
    }, 100);

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      clearInterval(interval); // Limpa o intervalo ao desmontar o componente
    };
  }, []);

  const handleReplaceMessage = (index) => {
    setVisibleMessages((prevMessages) => {
      const nextMessage = GlobalMessages.find((msg) => !msg.showed);
      if (nextMessage) {
        nextMessage.showed = true;

        const updatedMessages = [...prevMessages];
        updatedMessages[index] = nextMessage;

        // Atualiza o tempo restante para a nova mensagem
        setTimers((prevTimers) => {
          const newTimers = [...prevTimers];
          newTimers[index] = nextMessage.time;
          return newTimers;
        });

        setTimeout(() => handleReplaceMessage(index), nextMessage.time);

        return updatedMessages;
      }
      return prevMessages;
    });
  };

  return (
    <div className="IntervalFunction-wrapper flex w-screen max-w-[100%] justify-center items-center">
      {visibleMessages.map((message, index) => (
        <div
          key={index}
          className="border cursor-pointer IntervalFunction-border text-xs h-[95%] w-[358px] 2xl:w-[550px] ml-2 mr-2 mt-1 mb-1 rounded motion-preset-fade-lg motion-duration-1000 overflow-hidden p-1 flex flex-col gap-1"
        >
          <div className="flex items-center gap-1">
            <p className="text-blue-500 whitespace-nowrap">
              {message.username}:
            </p>
            <p className="whitespace-nowrap overflow-hidden text-ellipsis IntervalFunction-message">
              {message.message}
            </p>
          </div>
          <p className="text-gray-500">
            Tempo restante: {(timers[index] / 1000).toFixed(1)}s
          </p>
        </div>
      ))}
    </div>
  );
  // <div className="IntervalFunction-wrapper flex-1 text-black-400 relative right-0">
  //   {GlobalMessages.map((message, index) => (
  //     <div
  //       className={`w-full h-16 flex flex-col lg:flex lg:flex-row items-center gap-2  ${index === currentIndex ? "" : "hidden"}`}
  //       key={message.id}
  //     >
  //       <TextLimitComponent
  //         text={message.username + ":"}
  //         maxCharacters={40}
  //         className={`relative z-10 IntervalFunction-name lg:h-full text-xs lg:text-sm flex items-center justify-center -mt-4 -ml-14 lg:ml-0 lg:mt-0 ${index === currentIndex ? "animate-fadeIn" : "animate-fadeOut"}`}
  //         paragraphClassName="pl-2 font-semibold text-blue-500 pr-1"
  //       />

  //       <TextLimitComponent
  //         text={message.message}
  //         maxCharacters={300}
  //         className={`IntervalFunction-message relative flex-1 lg:text-sm text-xs z-0 flex items-center w-full ${index === currentIndex ? "animate-slideLeftResponsive lg:animate-slideLeft" : "hidden"}`}
  //         paragraphClassName="pr-2"
  //       />
  //     </div>
  //   ))}
  // </div>
  // );
};

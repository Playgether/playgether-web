import React from "react";
import Image from "next/legacy/image";
import DefaultButton from "../../elements/DefaultButton/DefaultButton";

interface SobreProps {
  onClickVoltar: () => void;
}

const Sobre = ({ onClickVoltar }: SobreProps) => {
  return (
    <div className="flex row-span-2 w-screen">
      <div className="w-screen flex flex-col items-center justify-center space-y-3 lg:space-y-4 xl:space-y-6 2xl:space-y-8 bg-gray-600 bg-opacity-60">
        <div className="relative sm:w-3/6 md:w-3/6 lg:w-3/6 xl:w-3/6 2xl:w-3/6  h-28 flex items-center justify-center w-5/6">
          <Image
            src={"/index/name.png"}
            width={0}
            height={0}
            alt={"logoname"}
            layout={"fill"}
            objectFit="contain"
          />
        </div>
        <div>
          <p className="text-white-200 text-center text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl ml-3 mr-3">
            Nós somos uma rede social que conecta gamers de todo o mundo. Aqui,
            você grava sua trajetória gamer e pode compartilhar com seus amigos
            todas as conquistas do jogo que você joga. Além disso, a nossa
            plataforma fornece diversos recursos para quem joga, como criação de
            clãs, comunidades, threads, conquistas para os games, eventos
            exclusivos, atualizações e muito mais.
          </p>
        </div>
        <div className="pb-2">
          <DefaultButton onClick={onClickVoltar} className="py-2 px-14">
            Voltar
          </DefaultButton>
        </div>
      </div>
    </div>
  );
};

export default Sobre;

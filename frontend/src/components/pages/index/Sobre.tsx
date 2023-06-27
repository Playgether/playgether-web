import React from "react";
import ImageComponent from "../../elements/ImageComponent";
import Button from "../../elements/Button";

const Sobre = ({onClickVoltar}) => {
    return (
        <div className='flex justify-center row-span-2 w-screen'>
            <div className='w-screen flex flex-col items-center justify-center space-y-6 bg-gray-600 bg-opacity-60'>
                <div className='relative w-4/6 sm:w-3/6 md:w-3/6 lg:w-3/6 xl:w-3/6 2xl:w-3/6'>
                    <ImageComponent src={"/index/name.png"} width={0} height={0} alt={"logoname"} layout={"responsive"}/>
                </div>
                <div>
                    <h1 className='text-white-200 text-center text-sm sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-xl'>Nós somos uma rede social que conecta gamers de todo o mundo. Aqui, você grava sua trajetória gamer e pode compartilhar com seus amigos todas as conquistas
                    do jogo que você joga. Além disso, a nossa plataforma fornece diversos recursos para quem joga, como criação de clãs, comunidades, threads, conquistas para os games, eventos exclusivos,
                    atualizações e muito mais.</h1>
                </div>
                <div>
                    <Button onClick={onClickVoltar} pxValue={14} pyValue={2} extraClassName={null}> Voltar </Button>
                </div>
            </div>
        </div>
    );
};

export default Sobre;
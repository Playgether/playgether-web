import React from "react";

interface SobreProps {
  onClickVoltar: () => void;
}

const Sobre = ({ onClickVoltar }: SobreProps) => {
  return (
    <section className="fixed inset-0 z-40 flex flex-col items-center justify-center px-4 animate-fade-up">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      <div className="relative z-10 max-w-3xl text-center">
        <div className="flex items-center justify-center -space-x-3 mb-6">
          <div className="w-14 h-14 rounded-full bg-secondary opacity-90" />
          <div className="w-14 h-14 rounded-full bg-neon-blue opacity-90" />
        </div>

        <h2 className="text-4xl md:text-6xl font-bold tracking-[0.2em] mb-8 text-foreground">
          <span className="text-secondary">PLAY</span>
          <span className="text-neon-blue">GETHER</span>
        </h2>

        <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10 tracking-wide">
          Nós somos uma rede social que conecta gamers de todo o mundo. Aqui,
          você grava sua trajetória gamer e pode compartilhar com seus amigos
          todas as conquistas do jogo que você joga. Além disso, a nossa
          plataforma fornece diversos recursos para quem joga, como criação de
          clãs, comunidades, threads, conquistas para os games, eventos
          exclusivos, atualizações e muito mais.
        </p>

        <button
          type="button"
          onClick={onClickVoltar}
          className="px-8 py-3 text-lg font-semibold tracking-widest uppercase rounded-lg border-2 border-foreground/30 text-foreground hover:border-neon-blue hover:text-neon-blue transition-all duration-300 bg-background/10 backdrop-blur-sm"
        >
          Voltar
        </button>
      </div>
    </section>
  );
};

export default Sobre;

import React from "react";

interface NormalProps {
  onClickCadastrar: () => void;
  onClickLogar: () => void;
}

const Normal = ({ onClickCadastrar, onClickLogar }: NormalProps) => {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="flex items-center -space-x-3 mb-6 animate-fade-up">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-secondary opacity-90" />
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-neon-blue opacity-90" />
      </div>

      <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-[0.3em] mb-4 animate-fade-up text-foreground">
        <span className="text-secondary">PLAY</span>
        <span
          className="text-neon-blue"
          style={{ textShadow: "0 0 30px hsl(var(--neon-blue) / 0.35)" }}
        >
          GETHER
        </span>
      </h1>

      <p
        className="text-muted-foreground text-lg md:text-xl tracking-wider mb-12 max-w-md animate-fade-up"
        style={{ animationDelay: "0.2s" }}
      >
        Conecte-se. Jogue. Conquiste.
      </p>

      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        <button
          type="button"
          onClick={onClickCadastrar}
          className="px-10 py-3 text-lg font-semibold tracking-widest uppercase rounded-lg gradient-primary text-primary-foreground hover:scale-105 hover:shadow-glow-primary transition-all duration-300"
        >
          CADASTRAR
        </button>
        <button
          type="button"
          onClick={onClickLogar}
          className="px-10 py-3 text-lg font-semibold tracking-widest uppercase rounded-lg border-2 border-foreground/30 text-foreground hover:border-neon-blue hover:text-neon-blue hover:shadow-glow-neon hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-background/10"
        >
          LOGAR
        </button>
      </div>
    </section>
  );
};

export default Normal;

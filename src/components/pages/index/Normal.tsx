import React from "react";
import { BrandLogo } from "@/components/general/BrandLogo";

interface NormalProps {
  onClickCadastrar: () => void;
  onClickLogar: () => void;
}

const Normal = ({ onClickCadastrar, onClickLogar }: NormalProps) => {
  return (
    <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="relative isolate mb-12 animate-fade-up">
        <span className="sr-only">Playgether</span>
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[110%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent blur-3xl dark:bg-white/30"
        />
        <BrandLogo
          variant="vertical"
          tone="color"
          alt=""
          className="mx-auto h-auto w-[min(85vw,22rem)] dark:[filter:drop-shadow(0_0_14px_rgba(255,255,255,0.45))] md:w-[min(70vw,30rem)]"
          priority
        />
      </h1>

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
          className="px-10 py-3 text-lg font-semibold tracking-widest uppercase rounded-lg border-2 border-white/70 bg-black/40 text-white shadow-sm backdrop-blur-md hover:border-white hover:bg-black/55 hover:scale-105 transition-all duration-300 dark:border-foreground/30 dark:bg-background/20 dark:shadow-none dark:backdrop-blur-none dark:hover:border-neon-blue dark:hover:bg-background/20 dark:hover:text-neon-blue dark:hover:shadow-glow-neon"
        >
          LOGAR
        </button>
      </div>
    </section>
  );
};

export default Normal;

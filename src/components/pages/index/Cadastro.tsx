import React from "react";
import { BrandLogo } from "@/components/general/BrandLogo";
import FormCadastro from "./FormCadastro";

interface CadastroProps {
  onClickX: () => void;
  onClickAqui: () => void;
}

const Cadastro = ({ onClickX, onClickAqui }: CadastroProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-up">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-background/80"
        onClick={onClickX}
      />

      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-foreground/10 bg-background shadow-lg">
        <button
          type="button"
          onClick={onClickX}
          className="w-full py-3 bg-background text-foreground/70 hover:text-foreground font-bold text-lg tracking-wider hover:opacity-90 transition-opacity sticky top-0 z-10"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="flex flex-col items-center pt-8">
          <BrandLogo
            variant="vertical"
            tone="mono"
            className="h-auto w-[min(60vw,15rem)] sm:w-[16rem]"
            priority
          />
        </div>

        <div className="px-8 pt-5 pb-8 space-y-5">
          <FormCadastro onClickAqui={onClickAqui} />
        </div>
      </div>
    </div>
  );
};

export default Cadastro;

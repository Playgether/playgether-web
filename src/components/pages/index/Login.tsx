import React from "react";
import FormLogin from "./FormLogin";

interface LoginProps {
  onClickX: () => void;
  onClickAqui: () => void;
}

const Login = ({ onClickX, onClickAqui }: LoginProps) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fade-up">
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClickX}
      />

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-foreground/10 bg-background shadow-glow-primary">
        <button
          type="button"
          onClick={onClickX}
          className="w-full py-3 text-primary-foreground font-bold text-lg tracking-wider hover:opacity-90 transition-opacity"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="flex flex-col items-center pt-8 pb-6 bg-foreground/5">
          <div className="flex items-center -space-x-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary" />
            <div className="w-12 h-12 rounded-full bg-neon-blue" />
          </div>

          <h2 className="text-2xl font-bold tracking-[0.2em] text-foreground">
            <span className="text-secondary">PLAY</span>
            <span className="text-neon-blue">GETHER</span>
          </h2>
        </div>

        <div className="p-8 space-y-5">
          <FormLogin onClickAqui={onClickAqui} />
        </div>
      </div>
    </div>
  );
};

export default Login;

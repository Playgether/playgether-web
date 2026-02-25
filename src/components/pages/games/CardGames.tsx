import React from "react";
import { twMerge } from "tailwind-merge";

interface CardGamesProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

/** Este é o Card padrão utilizado para rendenrizar as opção dos jogos */
export const CardGames: React.FC<CardGamesProps> = ({
  children,
  onClick,
  className,
}) => {
  return (
    <div
      className={twMerge(
        "overflow-hidden rounded-xl border border-border/50 bg-card/30 shadow-card hover:shadow-glow hover:cursor-pointer transition-all duration-200",
        "max-w-[20rem]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

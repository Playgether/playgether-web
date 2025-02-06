import React from "react";

interface CardGamesProps {
  children: React.ReactNode;
  onClick: () => void;
}

/** Este é o Card padrão utilizado para rendenrizar as opção dos jogos */
export const CardGames: React.FC<CardGamesProps> = ({ children, onClick }) => {
  return (
    <div
      className="max-w-[20rem] max-h-56 shadow-md shadow-[var(--shadow-color)] hover:cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

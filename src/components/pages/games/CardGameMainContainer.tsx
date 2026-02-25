import React, { FC } from "react";

interface CardGameMainContainerProps {
  children: React.ReactNode;
}

export const CardGameMainContainer: FC<CardGameMainContainerProps> = ({
  children,
}) => {
  return (
    <>
      <section className="text-center font-bold text-xl text-card-foreground">
        <h1 className="gradient-text">Conecte seus jogos</h1>
        <p className="text-sm text-muted-foreground font-normal mt-1">
          Selecione um jogo para conectar e exibir informações no seu perfil.
        </p>
      </section>

      {children}
    </>
  );
};

import React, { FC } from "react";

interface CardGameMainContainerProps {
  children: React.ReactNode;
}

export const CardGameMainContainer: FC<CardGameMainContainerProps> = ({
  children,
}) => {
  return (
    <>
      <section className="text-center pt-20 font-extrabold CardGameMainContainer-wrapper text-2xl">
        <h1>Conecte seus jogos</h1>
      </section>

      {children}
    </>
  );
};

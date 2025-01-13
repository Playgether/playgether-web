import React, { useState } from "react";
import { CardGameMainContainer } from "../games/CardGameMainContainer";
import { CardGames } from "../games/CardGames";
import CardImage from "../games/CardImage";
import GamesList from "../games/gamesList/gamesList";
import DefaultButton from "@/components/elements/DefaultButton/DefaultButton";

export const Game = () => {
  const [page, setPage] = useState<string | null>(null);

  const handleBackPage = () => setPage(null);

  return (
    <>
      {page ? (
        <>
          <DefaultButton
            onClick={handleBackPage}
            className="w-[5rem] h-[2rem] mx-5 my-6"
          >
            <h1 className="text-lg font-semibold">Voltar</h1>
          </DefaultButton>
          {page && GamesList[page]?.component}
        </>
      ) : (
        <CardGameMainContainer>
          <section className="flex gap-4 mt-20 items-center justify-center">
            {Object.keys(GamesList).map((game) => (
              <CardGames key={game} onClick={() => setPage(game)}>
                <CardImage
                  src={GamesList[game].src}
                  alt={GamesList[game].alt}
                />
              </CardGames>
            ))}
          </section>
        </CardGameMainContainer>
      )}
    </>
  );
};

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
            className="2xl:px-5 2xl:py-1 px-3 py-1 rounded mx-5 my-6"
          >
            <h1>Voltar</h1>
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

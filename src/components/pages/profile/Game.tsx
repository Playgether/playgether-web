import React, { useState } from "react";
import { CardGameMainContainer } from "../games/CardGameMainContainer";
import { CardGames } from "../games/CardGames";
import CardImage from "../games/CardImage";
import GamesList from "../games/gamesList/gamesList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Game = () => {
  const [page, setPage] = useState<string | null>(null);

  const handleBackPage = () => setPage(null);

  return (
    <>
      {page ? (
        <div className="animate-menuProfileFadeIn space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackPage}
              className="hover:shadow-card transition-shadow duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h3 className="text-lg font-semibold text-card-foreground capitalize">
              {page}
            </h3>
          </div>

          {page && GamesList[page]?.component}
        </div>
      ) : (
        <div className="animate-menuProfileFadeIn space-y-6">
          <CardGameMainContainer>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {Object.keys(GamesList).map((game) => (
                <CardGames
                  key={game}
                  onClick={() => setPage(game)}
                  className="max-w-none w-full hover-lift"
                >
                  <div className="group">
                    <div className="relative bg-muted/20">
                      <CardImage
                        src={GamesList[game].src}
                        alt={GamesList[game].alt}
                      />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-semibold text-card-foreground capitalize truncate">
                          {game}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Conectar conta
                        </div>
                      </div>
                      <div className="text-neon-blue font-bold">→</div>
                    </div>
                  </div>
                </CardGames>
              ))}
            </section>
          </CardGameMainContainer>
        </div>
      )}
    </>
  );
};

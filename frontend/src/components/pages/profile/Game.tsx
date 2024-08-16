import React from "react";
import { CardGames } from "../games/CardGames"
import CardImage from "../games/CardImage"

export const Game = () => {
    return (
        <main className="">
            <section className="text-center pt-20 font-extrabold text-orange-500 text-2xl">
                <h1>Conecte seus jogos</h1>
            </section>

            <section className="flex gap-4 mt-20">
                <CardGames>
                    <CardImage src="/games/League of Legends.png" alt="LoL Banner" />
                </CardGames>

                <CardGames>
                    <CardImage src="/games/Valorant.png" alt="Valorant Banner" />
                </CardGames>

                <CardGames>
                    <CardImage src="/games/Counter Strike 2.png" alt="LoL Banner" />
                </CardGames>

            </section>
        </main>
    )
}
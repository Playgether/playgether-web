import React, { useEffect, useState } from "react";
import { CardGames } from "../games/CardGames"
import CardImage from "../games/CardImage"
import ProfileLol from "../games/ProfileLol/ProfileLol";
import { ProfileLolContextProvider } from "../../../context/ProfileLolContext";

export const Game = () => {
    return (
        <main className="">
            <section className="text-center pt-20 font-extrabold text-orange-500 text-2xl">
                <h1>Conecte seus jogos</h1>
            </section>

            <section className="flex gap-4 mt-20 items-center justify-center">
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

            <section>
                <h2 className="text-center mt-20 font-extrabold text-orange-500 text-2xl">
                    Seus jogos conectados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-black-400  pb-2">
                    <ProfileLolContextProvider>
                        <ProfileLol />             
                    </ProfileLolContextProvider>
                </div>
            </section>
        </main>
    )
}
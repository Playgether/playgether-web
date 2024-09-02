import React, { useEffect, useState } from "react";
import { CardGames } from "../games/CardGames"
import CardImage from "../games/CardImage"
import { getEntries } from "../../../services/getEntries";
import { getAccountData } from "../../../services/getPuuid";

export const Game = () => {
    const [nameTag, setNameTag] = useState(null);
    const [entries, setEntries] = useState(null);

    useEffect(() => {
        const getSummonerId = async () => {
            try {
                const data = await getEntries();
                setEntries(data);
            } catch (error) {
                console.log(error);
            }
        };
        getSummonerId(); // Call the function to get Summoner ID when the component mount
    }, []);

    useEffect(() => {
        const getNameTag = async () => {
            try {
                const data = await getAccountData();
                setNameTag(data);
            } catch (error) {
                console.log(error);
            }
        };
        getNameTag(); // Call the function to get NameTag when the component mount
    }, [])
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

            <section>
                <h2 className="text-center mt-20 font-extrabold text-orange-500 text-2xl">
                    Seus jogos conectados
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-black-400  pb-2">
                    {nameTag? (
                        <div>
                            <p className="text-black-300">NickName: {nameTag.gameName}</p>
                            <p className="text-black-300">Tag: {nameTag.tagLine}</p>
                        </div>
                    ) : (
                        <div><p>no item</p></div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-black-400">
                    {entries? (
                        <div>
                            <p className="text-black-300">Elo: {entries.tier+" "+entries.rank}</p>
                            <p className="text-black-300">PDL: {entries.leaguePoints}</p>
                            <p className="text-black-300">Vitórias: {entries.wins}</p>
                            <p className="text-black-300">Derrotas: {entries.losses}</p>
                        </div>
                    ) : (
                        <div><p>no item</p></div>
                    )}
                </div>
            </section>
        </main>
    )
}
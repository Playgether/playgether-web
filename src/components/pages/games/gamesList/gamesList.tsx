import { ProfileLolContextProvider } from "@/context/ProfileLolContext";
import { gamesTypes } from "../../../../types/games";
import ProfileLol from "../ProfileLol/ProfileLol";
import ProfileValorant from "../ProfileValorant/ProfileValorant";

const GamesList: gamesTypes = {
    lol: {
        component: <ProfileLolContextProvider><ProfileLol /></ProfileLolContextProvider>,
        src: '/games/League of Legends.png',
        alt: 'LoL Banner'
    },
    valorant: {
        component: <ProfileValorant />,
        src: '/games/Valorant.png',
        alt: 'Valorant Banner'
    },
    cs2: {
        component: <p className="text-black-500 m-40">cs</p>,
        src: '/games/Counter Strike 2.png',
        alt: 'Counter Strike Banner'
    },
}

export default GamesList;
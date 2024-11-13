import { gamesTypes } from "../../../../types/games";
import ProfileLol from "../ProfileLol/ProfileLol";

const GamesList: gamesTypes = {
    lol: {
        component: <ProfileLol />,
        src: '/games/League of Legends.png',
        alt: 'LoL Banner'
    },
    valorant: {
        component: <p className="text-black-500 m-40">vava</p>,
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
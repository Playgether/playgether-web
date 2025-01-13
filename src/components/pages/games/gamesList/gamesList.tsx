import { ProfileLolContextProvider } from "@/context/ProfileLolContext";
import { gamesTypes } from "../../../../types/games";
import ProfileLol from "../ProfileLol/ProfileLol";
import ProfileValorant from "../ProfileValorant/ProfileValorant";
import { ProfileCS2 } from "../ProfileCS2/ProfileCS2";

const GamesList: gamesTypes = {
  lol: {
    component: (
      <ProfileLolContextProvider>
        <ProfileLol />
      </ProfileLolContextProvider>
    ),
    src: "/games/League of Legends.png",
    alt: "LoL Banner",
  },
  valorant: {
    component: <ProfileValorant />,
    src: "/games/Valorant.png",
    alt: "Valorant Banner",
  },
  cs2: {
    component: <ProfileCS2 />,
    src: "/games/Counter Strike 2.png",
    alt: "Counter Strike Banner",
  },
};

export default GamesList;

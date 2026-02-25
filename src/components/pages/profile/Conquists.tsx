import { FaWind } from "react-icons/fa";
import { IoPeopleSharp } from "react-icons/io5";
import { HiMiniTrophy } from "react-icons/hi2";
import { PiMaskHappyFill } from "react-icons/pi";
import { ConquistText } from "./ConquistText";

export const Conquists = () => {
  return (
    <div className="animate-menuProfileFadeIn w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">
          Suas Conquistas
        </h3>
      </div>

      <div className="space-y-4">
        <ConquistText
          date={"2023-03-28"}
          title="Mestre dos Ventos"
          text="Conquistou mais de 350 mil pontos com o personagem Yasuo"
          Icon={<FaWind className="h-8 w-8" />}
        />

        <ConquistText
          date={"02/02/2023"}
          title="Popular"
          text="Atingiu a marca de 100 mil seguidores"
          Icon={<IoPeopleSharp className="h-8 w-8" />}
        />

        <ConquistText
          date={"05/09/2022"}
          title="Campeão"
          text="Venceu em primeiro lugar o campeonato de CSGO: Counter Strinke Global Offensive Nutrion Cup kdsaopkopsakopdksadopsa"
          Icon={<HiMiniTrophy className="h-8 w-8" />}
        />

        <ConquistText
          date={"05/09/2022"}
          title="Amigável"
          text="Conseguiu um score de avaliações gerais superior a 4.0"
          Icon={<PiMaskHappyFill className="h-8 w-8" />}
        />
      </div>
    </div>
  );
};

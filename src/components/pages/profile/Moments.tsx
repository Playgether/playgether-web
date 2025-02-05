import { ConquistText } from "./ConquistText";

export const Moments = () => {
  return (
    <div className="Conquists-wrapper animate-menuProfileFadeIn h-full mt-4 w-full space-y-8 rounded-t-lg">
      <div className=" h-12 flex items-center justify-center font-semibold text-3xl">
        <p>Seus Marcos</p>
      </div>

      <div className="h-fit rounded-lg font-medium text-xl w-full min-h-[65vh]">
        <div className="Conquists-border ml-3 z-10 space-y-4">
          <ConquistText
            date={"05/04/2024"}
            title="Platina no LoL"
            text="Peguei platina nesta season novamente, mesmo não jogando tanto. "
          />

          <ConquistText
            date={"02/02/2023"}
            title="Radiante no Valorant"
            text="Hoje pela primeira vez consegui pegar radiante no Valorant, depois de muito tempo tentando, estou muito feliz aaaaaaaaaaaahhh !!!"
          />

          <ConquistText
            date={"05/09/2022"}
            title="Comecei a jogar LoL"
            text="Hoje comecei a jogar lol, a priore não gostei muito, mas vou tentar jogar mais um pouco para ver se me acostumo."
          />

          <ConquistText
            date={"05/09/2022"}
            title="Primeiro dia com o pc gamer"
            text="Neste dia, um sonho de criança foi realizado, primeira vez que liguei meu pc gamer"
          />
        </div>
      </div>
    </div>
  );
};

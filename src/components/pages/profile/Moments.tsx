import { ConquistText } from "./ConquistText";

export const Moments = () => {
  return (
    <div className="animate-menuProfileFadeIn w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-card-foreground">Seus Marcos</h3>
      </div>

      <div className="space-y-4">
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
  );
};
